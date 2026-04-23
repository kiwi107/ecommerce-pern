//promotions and discounts management
const pool = require('../config/db.js');

const getCoupon = async (req, res) => {
    try {
        const { code } = req.body

        const coupan = await pool.query(`SELECT * FROM coupons WHERE code=$1`, [code])
        //if not found
        if (coupan.rows.length === 0) {
            return res.status(404).json({ message: "Coupon not found" })
        }
        //if expired
        const currentDate = new Date();
        const expiryDate = new Date(coupan.rows[0].end_date);
        if (currentDate > expiryDate) {
            return res.status(400).json({ message: 'Coupon expired' });
        }
        //if user exceeded the limit
        const userId = req.user.user_id
        const coupan_usage = await pool.query(`SELECT * FROM coupon_usage WHERE user_id=$1 AND coupon_id=$2`, [userId, coupan.rows[0].coupon_id])
        if (coupan_usage.rows.length >= coupan.rows[0].per_user_limit) {
            return res.status(400).json({ message: "Coupan limit exceeded" })
        }
        res.status(200).json({ message: "success", discount_amount: coupan.rows[0].discount_amount })
    }
    catch (err) {
        console.error('Error fetching promotions:', err);
        res.status(500).json({ message: 'Server error' });
    }
}



const getAllCoupons = async (req, res) => {
    try {
        const coupons = await pool.query(`SELECT * FROM coupons`);
        res.json({ coupons: coupons.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
// Create a new coupon
const insertCoupon = async (req, res) => {
    try {
        const { code, discount_amount, description, start_date, end_date, per_user_limit } = req.body;

        // Validate the incoming data
        if (!code || !start_date || !end_date) {
            return res.status(400).json({ message: 'Code, start date, and end date are required' });
        }

        // Insert new coupon into the database
        const newCoupon = await pool.query(
            `INSERT INTO coupons (code, discount_amount, description, start_date, end_date, per_user_limit)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [code, discount_amount, description, start_date, end_date, per_user_limit]
        );

        res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon.rows[0] });
    } catch (err) {
        console.error('Error creating coupon:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Delete a coupon
const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        // Check if the coupon exists
        const couponCheck = await pool.query(`SELECT * FROM coupons WHERE coupon_id = $1`, [couponId]);
        if (couponCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Delete coupon from the coupons table
        await pool.query(`DELETE FROM coupons WHERE coupon_id = $1`, [couponId]);

        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (err) {
        console.error('Error deleting coupon:', err);
        res.status(500).json({ message: 'Server error' });
    }
};





// Get usage report for a specific coupon (admin)
const getCouponUsage = async (req, res) => {
    try {
        const { couponId } = req.params;

        const couponIdInt = parseInt(couponId, 10);
        if (isNaN(couponIdInt)) {
            return res.status(400).json({ message: 'Invalid coupon ID' });
        }

        const couponCheck = await pool.query(`SELECT * FROM coupons WHERE coupon_id = $1`, [couponIdInt]);
        if (couponCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const usage = await pool.query(`
            SELECT user_id, order_id, used_at
            FROM coupon_usage
            WHERE coupon_id = $1
            ORDER BY used_at DESC
        `, [couponIdInt]);

        res.status(200).json(usage.rows);
    } catch (err) {
        console.error('Error fetching coupon usage:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


const editCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const { code, discount_amount, description, start_date, end_date, per_user_limit, is_active } = req.body;

        // Check if the coupon exists
        const couponCheck = await pool.query(`SELECT * FROM coupons WHERE coupon_id = $1`, [couponId]);
        if (couponCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Update the coupon
        await pool.query(
            `UPDATE coupons SET code=$1, discount_amount=$2, description=$3, start_date=$4, end_date=$5, per_user_limit=$6, is_active=$7 WHERE coupon_id=$8`,
            [code, discount_amount, description, start_date, end_date, per_user_limit, is_active, couponId]
        );

        res.status(200).json({ message: 'Coupon updated successfully' });
    } catch (err) {
        console.error('Error updating coupon:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getCoupon,
    getAllCoupons,
    insertCoupon,
    deleteCoupon,
    getCouponUsage,
    editCoupon
}