//promotions and discounts management
const pool = require('../config/db.js'); 

const getCoupon = async (req, res) => {
    try {
        const {code} = req.body
      
        const coupan= await pool.query(`SELECT * FROM coupons WHERE code=$1`,[code])
        //if not found
        if(coupan.rows.length===0){
            return res.status(404).json({message:"Coupon not found"})
        }
        //if expired
        const currentDate = new Date();
        const expiryDate = new Date(coupan.rows[0].end_date);
        if (currentDate > expiryDate) {
            return res.status(400).json({ message: 'Coupon expired' });
        }
        //if user exceeded the limit
        const userId = req.user.user_id
        const coupan_usage = await pool.query(`SELECT * FROM coupon_usage WHERE user_id=$1 AND coupon_id=$2`,[userId,coupan.rows[0].coupon_id])
        if(coupan_usage.rows.length>=coupan.rows[0].per_user_limit){
            return res.status(400).json({message:"Coupan limit exceeded"})
        }
        res.status(200).json({message:"success",discount_amount:coupan.rows[0].discount_amount})
    }
    catch (err) {
        console.error('Error fetching promotions:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getCoupon
}