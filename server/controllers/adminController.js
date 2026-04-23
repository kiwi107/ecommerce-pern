const pool = require('../config/db'); // Adjust the path to your db.js file




// GET all campaigns
const getAllCampaigns = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promotional_campaigns ORDER BY campaign_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new campaign
const createCampaign = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO promotional_campaigns (name) VALUES ($1)', [name]);
    res.status(201).json({ message: 'Campaign created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE campaign
const deleteCampaign = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM promotional_campaigns WHERE campaign_id = $1', [id]);
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET campaign impact
const getCampaignImpact = async (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT
      pc.campaign_id,
      pc.name AS campaign_name,
      COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
      COALESCE(SUM(pb.price * (1 - d.discount_amount / 100.0) * oi.quantity), 0) AS total_revenue_generated,
      COUNT(DISTINCT o.order_id) AS related_orders
    FROM promotional_campaigns pc
    JOIN discounts d ON pc.campaign_id = d.campaign_id
    JOIN product_base pb ON d.product_id = pb.product_id
    JOIN product_variant pv ON pb.product_id = pv.product_id
    JOIN order_items oi ON pv.variant_id = oi.variant_id
    JOIN orders_base o ON oi.order_id = o.order_id
    WHERE pc.campaign_id = $1
      AND (o.status).stage = 'Delivered'
    GROUP BY pc.campaign_id, pc.name
  `;
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.json({
        campaign_name: 'No Data',
        total_quantity_sold: 0,
        total_revenue_generated: 0,
        related_orders: 0
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET discounts for a campaign (with product name)
const getDiscountsByCampaign = async (req, res) => {
  const campaignId = req.params.campaignId;
  const query = `
    SELECT d.discount_id, d.product_id, pb.name AS product_name, d.discount_amount, d.created_at
    FROM discounts d
    JOIN product_base pb ON d.product_id = pb.product_id
    WHERE d.campaign_id = $1
    ORDER BY d.created_at DESC
  `;
  try {
    const result = await pool.query(query, [campaignId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const createDiscount = async (req, res) => {
  const { campaignId } = req.params;
  const { product_id, discount_amount } = req.body;

  const query = `
    INSERT INTO discounts (campaign_id, product_id, discount_amount)
    VALUES ($1, $2, $3)
    RETURNING discount_id
  `;

  try {
    await pool.query('BEGIN');
    await pool.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const checkDiscountQuery = `
      SELECT 1 FROM discounts
      WHERE campaign_id = $1 AND product_id = $2
    `;

    const checkResult = await pool.query(checkDiscountQuery, [campaignId, product_id]);

    if (checkResult.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(409).json({ message: 'Discount already exists for this product in this campaign.' });
    }

    const result = await pool.query(query, [campaignId, product_id, discount_amount]);

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Discount created successfully',
      discount_id: result.rows[0].discount_id
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};


// UPDATE discount (change product_id and/or discount_amount)
const updateDiscount = async (req, res) => {
  const discountId = req.params.discountId;
  const { product_id, discount_amount } = req.body;
  const query = `
    UPDATE discounts
    SET product_id = $1, discount_amount = $2, created_at = CURRENT_TIMESTAMP
    WHERE discount_id = $3
  `;
  try {
    await pool.query(query, [product_id, discount_amount, discountId]);
    res.json({ message: 'Discount updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE discount
const deleteDiscount = async (req, res) => {
  const discountId = req.params.discountId;
  try {
    await pool.query('DELETE FROM discounts WHERE discount_id = $1', [discountId]);
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { get } = require('http');
// Helper to upload multiple images
const uploadImagesToCloudinary = (files) => {
  return Promise.all(files.map(file => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ecommerce/product_photos' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }));
};

const getAllProducts = async (req, res) => {
  const result = await pool.query('SELECT * FROM product_base');
  res.json({ products: result.rows });
};

const getProductBase = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM product_base WHERE product_id=$1', [id]);
  res.json(result.rows[0]);
};

const getProductDetails = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM product_details WHERE product_id=$1', [id]);
  res.json(result.rows[0]);
};

const getProductVariants = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM product_variant WHERE product_id=$1', [id]);
  res.json(result.rows);
};

const createProduct = async (req, res) => {
  try {
    const { name, price, category, gender, description, available_colors, available_sizes, loyalty_points, variants } = req.body;
    const uploadedImages = await uploadImagesToCloudinary(req.files);
    const imageUrls = uploadedImages;  // array of urls

    const resultBase = await pool.query(
      `INSERT INTO product_base (name, price, category, images, gender) VALUES ($1, $2, $3, $4, $5) RETURNING product_id`,
      [name, price, category, imageUrls, gender]
    );
    const productId = resultBase.rows[0].product_id;

    await pool.query(
      `INSERT INTO product_details (product_id, description, available_colors, available_sizes, loyalty_points)
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, description, available_colors.split(','), available_sizes.split(','), loyalty_points]
    );

    const variantArray = JSON.parse(variants);
    for (const v of variantArray) {
      await pool.query(
        `INSERT INTO product_variant (product_id, size, color, stock_number) VALUES ($1, $2, $3, $4)`,
        [productId, v.size, v.color, v.stock_number]
      );
    }

    res.status(201).json({ message: 'Product created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, price, category, gender, description, available_colors, available_sizes, loyalty_points, variants } = req.body;

    // Handle images if provided
    let imageUrls = null;
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadImagesToCloudinary(req.files);
      imageUrls = uploadedImages;
    }

    // Update product_base
    const baseQuery = imageUrls
      ? `UPDATE product_base SET name=$1, price=$2, category=$3, gender=$4, images=$5 WHERE product_id=$6`
      : `UPDATE product_base SET name=$1, price=$2, category=$3, gender=$4 WHERE product_id=$5`;

    const baseValues = imageUrls
      ? [name, price, category, gender, imageUrls, id]
      : [name, price, category, gender, id];

    await pool.query(baseQuery, baseValues);

    // If details present, update details
    if (description !== undefined) {
      await pool.query(
        `UPDATE product_details SET description=$1, available_colors=$2, available_sizes=$3, loyalty_points=$4 WHERE product_id=$5`,
        [description, available_colors.split(','), available_sizes.split(','), loyalty_points, id]
      );
    }

    // If variants present, update variants
    if (variants) {
      const variantArray = JSON.parse(variants);
      await pool.query(`DELETE FROM product_variant WHERE product_id=$1`, [id]);
      for (const v of variantArray) {
        await pool.query(
          `INSERT INTO product_variant (product_id, size, color, stock_number) VALUES ($1, $2, $3, $4)`,
          [id, v.size, v.color, v.stock_number]
        );
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating product' });
  }
};


const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM product_variant WHERE product_id=$1', [id]);
  await pool.query('DELETE FROM product_details WHERE product_id=$1', [id]);
  await pool.query('DELETE FROM product_base WHERE product_id=$1', [id]);
  res.json({ message: 'Product deleted successfully' });
};



const getTopProducts = async (req, res) => {
  const { from, to } = req.query;
  try {
    const query = `
      SELECT
        pb.product_id,
        pb.name,
        pb.price,
        pb.category,
        pb.images,
        pb.gender,
        SUM(oi.quantity) AS total_quantity_sold,
        SUM(pb.price * oi.quantity) AS total_revenue
      FROM order_items oi
      JOIN orders_base o ON oi.order_id = o.order_id
      JOIN product_variant pv ON oi.variant_id = pv.variant_id
      JOIN product_base pb ON pv.product_id = pb.product_id
      WHERE (o.status).stage = 'Delivered'
        AND o.order_date >= $1
        AND o.order_date < $2
      GROUP BY pb.product_id, pb.name, pb.price, pb.category, pb.images, pb.gender
      ORDER BY total_quantity_sold DESC
      LIMIT 10;
    `;
    const values = [from, to];
    const { rows } = await pool.query(query, values);
    res.json(rows);
    console.log(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch top products' });
  }
};



const getCampaignReport = async (req, res) => {
  try {
    const query = `
    SELECT
  pc.campaign_id,
  pc.name AS campaign_name,
  SUM(oi.quantity) AS total_quantity_sold,
  SUM(pb.price * (1 - d.discount_amount / 100.0) * oi.quantity) AS total_revenue_generated,
  COUNT(DISTINCT o.order_id) AS related_orders
FROM promotional_campaigns pc
JOIN discounts d ON pc.campaign_id = d.campaign_id
JOIN product_base pb ON d.product_id = pb.product_id
JOIN product_variant pv ON pb.product_id = pv.product_id
JOIN order_items oi ON pv.variant_id = oi.variant_id
JOIN orders_base o ON oi.order_id = o.order_id
WHERE pc.campaign_id = $1
  AND (o.status).stage = 'Delivered'
GROUP BY pc.campaign_id, pc.name
ORDER BY total_revenue_generated DESC;
    `;

    const result = await pool.query(query, [req.params.campaignId]);
    res.json({ campaigns: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching campaign report' });
  }
};




// Fetch all orders with basic info
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT order_id, client_id, order_date, (status).stage AS stage, (status).updated_at AS updated_at, (status).note AS note
      FROM orders_base
      ORDER BY order_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch order details and items
const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  try {
    const detailsResult = await pool.query(`
      SELECT payment_method, chosen_address, total_price, updated_at
      FROM orders_details
      WHERE order_id = $1
    `, [orderId]);

    const itemsResult = await pool.query(`
      SELECT oi.variant_id, oi.quantity, pb.name, pb.price, pv.color, pv.size
      FROM order_items oi
      JOIN product_variant pv ON oi.variant_id = pv.variant_id
      JOIN product_base pb ON pv.product_id = pb.product_id
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({
      order_details: detailsResult.rows[0],
      order_items: itemsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { stage } = req.body;
  const updatedAt = new Date();

  const allowedStages = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const stageToNoteMap = {
    'Processing': 'Order is being processed',
    'Shipped': 'Order shipped with carrier',
    'Out for Delivery': 'Courier is delivering the order',
    'Delivered': 'Order delivered to customer',
  };

  if (!allowedStages.includes(stage)) {
    return res.status(400).json({ error: 'Invalid stage value' });
  }

  const note = stageToNoteMap[stage]; // Auto assign note based on stage

  try {
    await pool.query(`
      UPDATE orders_base
      SET status = ROW($1, $2, $3)::status_info
      WHERE order_id = $4
    `, [stage, updatedAt, note, orderId]);

    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};



// const getTopProducts = async (req, res) => {
//     const { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//         return res.status(400).json({ message: 'Start date and end date are required' });
//     }

//     try {
//         await pool.query('BEGIN');
//         await pool.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
//         const result = await pool.query(
//             `SELECT * FROM generate_top_selling_report($1, $2)`,
//             [startDate, endDate]
//         );
//         await pool.query('COMMIT');
//         res.status(200).json({
//             message: 'Top Selling Products Report generated successfully',
//             data: result.rows
//         });

//     } catch (err) {
//         await pool.query('ROLLBACK');
//         res.status(500).json({
//             message: 'Failed to generate the report',
//             error: err.message
//         });
//     }
// };

const getAllRefunds = async (req, res) => {
  try {
    const result = await pool.query(`
          SELECT 
              r.refund_id,
              r.order_id,
              r.variant_id,
              r.refunded_quantity,
              r.refund_amount,
              r.reason,
              r.status,
              r.requested_at,
              r.processed_at,
              pb.name AS product_name,
              pv.color,
              pv.size
          FROM refunds r
          JOIN product_variant pv ON r.variant_id = pv.variant_id
          JOIN product_base pb ON pv.product_id = pb.product_id
          ORDER BY r.requested_at DESC
      `);

    res.json({ refunds: result.rows });
  } catch (err) {
    console.error('Error fetching refunds with product info:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateRefundStatus = async (req, res) => {
  const { refundId } = req.params;
  const { status } = req.body;

 

  const validStatuses = ['Requested', 'Approved', 'Rejected', 'Processed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(`
      UPDATE refunds
      SET status = $1, processed_at = CURRENT_TIMESTAMP
      WHERE refund_id = $2
    `, [status, refundId]);

    console.log('Refund status updated:', result)




    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating refund status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const updateInventory = async (req, res) => {
    const { variantId } = req.params;
    const { stock_number } = req.body;
    try {
        await pool.query(`UPDATE product_variant SET stock_number = $1 WHERE variant_id = $2`, [stock_number, variantId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


const getInventory = async (req, res) => {
try {
    const productsRes = await pool.query(`
        SELECT 
            pb.product_id,
            pb.name,
            pb.price,
            pb.category,
            pb.images,
            pb.gender,
            pd.description,
            pd.available_colors,
            pd.available_sizes,
            pd.loyalty_points,
            ARRAY_AGG(
                json_build_object(
                    'variant_id', pv.variant_id,
                    'size', pv.size,
                    'color', pv.color,
                    'stock_number', pv.stock_number
                )
            ) AS variants
        FROM product_base pb
        LEFT JOIN product_details pd ON pb.product_id = pd.product_id
        LEFT JOIN product_variant pv ON pb.product_id = pv.product_id
        GROUP BY pb.product_id, pb.name, pb.price, pb.category, pb.images, pb.gender, pd.description, pd.available_colors, pd.available_sizes, pd.loyalty_points
    `);

    res.json(productsRes.rows);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
}

};





const getTags = async (req, res) => {
    const result = await pool.query('SELECT * FROM tags');
    res.json(result.rows);
};

const createTag = async (req, res) => {
    const { name } = req.body;
    await pool.query('INSERT INTO tags (tag_name) VALUES ($1)', [name]);
    res.sendStatus(201);
};

const deleteTag = async (req, res) => {
    const { tagId } = req.params;
    await pool.query('DELETE FROM tags WHERE tag_id = $1', [tagId]);
    res.sendStatus(204);
};

const getProductsForTag = async (req, res) => {
    const { tagId } = req.params;
    const result = await pool.query(`
        SELECT p.product_id, p.name, p.images
        FROM product_tags pt
        JOIN product_base p ON p.product_id = pt.product_id
        WHERE pt.tag_id = $1
    `, [tagId]);
    res.json(result.rows);
};

const insertProductToTag = async (req, res) => {
    const { tagId } = req.params;
    const { product_id } = req.body;
    await pool.query('INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [product_id, tagId]);
    res.sendStatus(201);
};

const removeProductFromTag = async (req, res) => {
    const { tagId, productId } = req.params;
    await pool.query('DELETE FROM product_tags WHERE tag_id = $1 AND product_id = $2', [tagId, productId]);
    res.sendStatus(204);
};

module.exports = {
  getAllCampaigns,
  createCampaign,
  deleteCampaign,
  getCampaignImpact,
  getDiscountsByCampaign,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAllProducts, createProduct, deleteProduct, updateProduct,
  getProductBase, getProductDetails, getProductVariants,
  getTopProducts, getCampaignReport,
  getAllOrders, getOrderDetails, updateOrderStatus, getAllRefunds, updateRefundStatus,
  updateInventory,
  getInventory, getTags, createTag, deleteTag,
  getProductsForTag, insertProductToTag, removeProductFromTag

};
