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

       // console.log(products.rows);
        res.json({ products: products.rows });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getTags,
    getProductsForTag
};