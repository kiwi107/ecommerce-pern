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
        const products = await pool.query('SELECT * FROM product_tags pt,product_base p, tags t WHERE pt.tag_id = $1 AND pt.product_id = p.product_id AND pt.tag_id = t.tag_id', [tag_id]);
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
    const result = await pool.query(
      `SELECT 
         pb.product_id, pb.name, pb.price, pb.category, pb.gender, pb.images,
         pd.description, pd.loyalty_points,
         pv.variant_id, pv.size, pv.color, pv.stock_number,
         pr.rating, pr.comment, pr.created_at,
         a.username AS reviewer_name -- Join and select the reviewer's username
       FROM product_base pb
       JOIN product_details pd ON pb.product_id = pd.product_id
       LEFT JOIN product_variant pv ON pb.product_id = pv.product_id  -- LEFT JOIN to allow products without variants
       LEFT JOIN product_reviews pr ON pb.product_id = pr.product_id  -- LEFT JOIN to allow products without reviews
       LEFT JOIN accounts a ON pr.account_id = a.account_id  -- Join to get the reviewer's username
       WHERE pb.product_id = $1`,
      [product_id]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Extract the base product details (assuming first row has the basic details)
    const base = rows[0];

    // Initialize the product object
    const product = {
      product_id: base.product_id,
      name: base.name,
      price: base.price,
      category: base.category,
      gender: base.gender,
      loyalty_points: base.loyalty_points,
      images: base.images, // If stored as text[] or JSON array
      description: base.description,
      variants: [],
      reviews: []
    };

    // Separate logic for variants and reviews
    let reviewsAdded = false; // Flag to track if reviews have been added

    rows.forEach(row => {
      // Add variant details (only once per variant_id)
      if (row.variant_id && !product.variants.some(variant => variant.variant_id === row.variant_id)) {
        product.variants.push({
          variant_id: row.variant_id,
          size: row.size,
          color: row.color,
          stock_number: row.stock_number,
        });
      }

      // Add review details (only once)
      if (row.rating !== null && row.comment && !reviewsAdded) {
        product.reviews.push({
          rating: row.rating,
          comment: row.comment,
          reviewer_name: row.reviewer_name ,
          created_at: row.created_at 
        });
        reviewsAdded = true; // Set the flag to true, so reviews are added only once
      }
    });

    res.json({ product });
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