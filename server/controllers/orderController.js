// Order placement, management, refunds

const pool = require('../config/db'); // Adjust the path to your db.js file

const getOrders= async (req, res) => {
    try {
        const { account_id } = req.user; // Get the user ID from the request object
        const orders=await pool.query('SELECT * FROM orders where account_id=$1',[account_id])
        res.status(200).json(orders.rows)

    }
    catch(error){
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports={
getOrders
}