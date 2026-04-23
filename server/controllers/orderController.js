// Order placement, management, refunds

const { Pool } = require('pg');
const pool = require('../config/db'); // Adjust the path to your db.js file

const getOrders = async (req, res) => {
    try {
        const { account_id } = req.user;

        const orders = await pool.query(`
            SELECT 
                ob.order_id,
                ob.client_id,
                ob.order_date,
                od.payment_method,
                od.chosen_address,
                ob.status,
                od.total_price,
                ob.created_at,
                od.updated_at
            FROM orders_base ob
            JOIN orders_details od ON ob.order_id = od.order_id
            WHERE ob.client_id = $1
        `, [account_id]);

        res.status(200).json(orders.rows);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const createOrder = async (req, res) => {
    const { payment_method, address, items, total_price, shipping_area, shipping_fee, coupon } = req.body;
    const client_id = req.user.user_id;

    try {
        await pool.query('BEGIN');

        const orderBaseInsert = await pool.query(
            `INSERT INTO orders_base (client_id, status)
             VALUES ($1, ROW('Processing', CURRENT_TIMESTAMP, 'We have received your order and are processing it.'))
             RETURNING order_id`,
            [client_id]
        );

        const orderId = orderBaseInsert.rows[0].order_id;

        await pool.query(
            `INSERT INTO orders_details (order_id, payment_method, chosen_address, total_price, shipping_area, shipping_fee)
             VALUES ($1, $2, ROW($3, $4, $5, $6, $7), $8, $9, $10)`,
            [
                orderId,
                payment_method,
                address.street,
                address.apartment_no,
                address.floor,
                address.city,
                address.country,
                total_price,
                shipping_area,
                shipping_fee
            ]
        );

        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (order_id, variant_id, quantity)
                 VALUES ($1, $2, $3)`,
                [orderId, item.variant_id, item.quantity]
            );

            await pool.query(
                `UPDATE product_variant
                 SET stock_number = stock_number - $1
                 WHERE variant_id = $2`,
                [item.quantity, item.variant_id]
            );
        }

       
        if (coupon) {
            const couponQuery = await pool.query(`SELECT coupon_id FROM coupons WHERE code = $1`, [coupon.code]);
            if (couponQuery.rows.length > 0) {
                const couponId = couponQuery.rows[0].coupon_id;
                await pool.query(
                    `INSERT INTO coupon_usage (coupon_id, user_id, order_id)
                     VALUES ($1, $2, $3)`,
                    [couponId, client_id, orderId]
                );
            }
        }

        await pool.query('COMMIT');
        res.json({ message: 'Order placed', order_id: orderId });

    } catch (err) {
        console.log('Transaction rolled back due to error:', err.Error);
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Failed to place order' });
    }
};


const getOrderDetails = async (req, res) => {
    const { order_id } = req.params;
    try {
        const orderQuery = `
            SELECT json_agg(order_data) AS order
            FROM (
                SELECT 
                    ob.order_id,
                    ob.created_at,
                    json_build_object(
                        'stage', s.stage,
                        'timestamp', s.updated_at,
                        'note', s.note
                    ) AS status
                FROM orders_base ob
                JOIN orders_details od ON ob.order_id = od.order_id,
                LATERAL (SELECT (ob.status).* ) AS s
                WHERE ob.order_id = $1
            ) AS order_data
        `;

        const itemsQuery = `
            SELECT 
                oi.quantity,
                pv.variant_id,
                pv.color,
                pv.size,
                pb.product_id,
                pb.name AS product_name,
                pb.price,
                pb.images
            FROM order_items oi
            JOIN product_variant pv ON oi.variant_id = pv.variant_id
            JOIN product_base pb ON pv.product_id = pb.product_id
            WHERE oi.order_id = $1
        `;




        const [orderResult, itemsResult] = await Promise.all([
            pool.query(orderQuery, [order_id]),
            pool.query(itemsQuery, [order_id])
        ]);

        if (orderResult.rows.length === 0 || !orderResult.rows[0].order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const all = await pool.query(`
SELECT
  o.order_id,
  o.order_date,
  od.payment_method,
  od.total_price,
  ARRAY_AGG(
    jsonb_build_object(
      'variant_id', oi.variant_id,
      'name', pb.name,
      'color', pv.color,
      'size', pv.size,
      'quantity', oi.quantity
    )
  ) AS items,
  jsonb_build_object(
    'stage', (o.status).stage,
    'updated_at', (o.status).updated_at,
    'note', (o.status).note
  ) AS order_status
FROM orders_base o
JOIN orders_details od ON o.order_id = od.order_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN product_variant pv ON oi.variant_id = pv.variant_id
JOIN product_base pb ON pv.product_id = pb.product_id
WHERE o.order_id = $1
GROUP BY o.order_id, od.payment_method, od.total_price, o.order_date, o.status
ORDER BY o.order_date DESC;



        `, [order_id]);

        const order = all.rows[0];
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            order: order

        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};



const createRefundRequest = async (req, res) => {
    const { order_id } = req.params;
    const { refunds } = req.body;

    if (!refunds || !Array.isArray(refunds) || refunds.length === 0) {
        return res.status(400).json({ message: 'Invalid refund data.' });
    }


    try {
        await pool.query('BEGIN');

        for (let refund of refunds) {
            const { variant_id, refund_quantity, reason } = refund;


            // Validate ordered quantity
            const result = await pool.query(
                `SELECT quantity FROM order_items WHERE order_id = $1 AND variant_id = $2`,
                [order_id, variant_id]
            );
            if (result.rows[0].quantity < refund_quantity) {
                throw new Error(`Refund quantity exceeds ordered quantity for variant_id: ${variant_id}`);
            }

            const orderedQty = result.rows[0].quantity;





            // (Optional) Calculate refund_amount using product price
            const priceResult = await pool.query(
                `SELECT pb.price FROM product_variant pv JOIN product_base pb ON pv.product_id = pb.product_id WHERE pv.variant_id = $1`,
                [variant_id]
            );

            const pricePerUnit = priceResult.rows[0].price;
            const refundAmount = parseFloat(pricePerUnit) * refund_quantity;

            // Insert refund request
            await pool.query(
                `INSERT INTO refunds (order_id, variant_id, refunded_quantity, refund_amount, reason, status)
                 VALUES ($1, $2, $3, $4, $5, 'Requested')`,
                [order_id, variant_id, refund_quantity, refundAmount, reason]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: 'Refund request submitted successfully.' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};





module.exports = {
    getOrders,
    createOrder,
    getOrderDetails,
    createRefundRequest

}