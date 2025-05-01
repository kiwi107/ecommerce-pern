//get, add, update, delete
// reviews and ratings

const pool = require('../config/db.js');


const getTags = async (req, res) => {
  try {
    const tags = await pool.query('SELECT * FROM tags');
    res.json({ tags: tags.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

const getProductsForTag = async (req, res) => {
  const { tag_id } = req.params;
  try {
    const products = await pool.query(`SELECT *
    FROM product_tags pt
    JOIN product_base p ON pt.product_id = p.product_id
    JOIN tags t ON pt.tag_id = t.tag_id
    LEFT JOIN discounts d ON p.product_id = d.product_id
    WHERE pt.tag_id = $1`, [tag_id]);
    res.json({ products: products.rows });
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
}


const getProductDetails = async (req, res) => {
  const { product_id } = req.params;

  try {


    const all = await pool.query(`SELECT 
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

  -- Aggregate variants as array of JSON objects
  ARRAY_AGG(
    DISTINCT jsonb_build_object(
      'variant_id', pv.variant_id,
      'size', pv.size,
      'color', pv.color,
      'stock_number', pv.stock_number
    )
  ) FILTER (WHERE pv.variant_id IS NOT NULL) AS variants,

  -- Aggregate reviews as array of JSON with username
  ARRAY_AGG(
    DISTINCT jsonb_build_object(
      'account_id', pr.account_id,
      'username', c.username,
      'rating', pr.rating,
      'comment', pr.comment,
      'created_at', pr.created_at
    )
  ) FILTER (WHERE pr.account_id IS NOT NULL) AS reviews,

  -- Scalar subquery to get the latest discount amount from active campaign
  (
    SELECT d.discount_amount
    FROM discounts d
    JOIN promotional_campaigns pc ON d.campaign_id = pc.campaign_id
    WHERE d.product_id = pb.product_id
      AND pc.is_active = TRUE
    ORDER BY d.created_at DESC
    LIMIT 1
  ) AS discount_amount

FROM product_base pb
LEFT JOIN product_details pd ON pb.product_id = pd.product_id
LEFT JOIN product_variant pv ON pb.product_id = pv.product_id
LEFT JOIN product_reviews pr ON pb.product_id = pr.product_id
LEFT JOIN client c ON pr.account_id = c.account_id

WHERE pb.product_id = $1

GROUP BY pb.product_id, pb.name, pb.price, pb.category, pb.images, pb.gender,
         pd.description, pd.available_colors, pd.available_sizes, pd.loyalty_points

ORDER BY pb.product_id;

    `, [product_id]);
    if (all.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = all.rows[0]

    res.json({ product: product });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports = {
  getTags,
  getProductsForTag,
  getProductDetails
};