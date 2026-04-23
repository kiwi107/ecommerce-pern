//profile
const pool = require('../config/db');
const cloudinary = require('../config/cloudinary'); // Import your Cloudinary configuration

const getUsers = async (req, res) => {
  try {
    const users = await pool.query(`SELECT * FROM accounts`);
    if (users.rows.length === 0) {
      return res.status(404).json({ message: "No users found" })
    }
    res.status(200).json({ users: users.rows })
  }
  catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }

}

const insertAddress = async (req, res) => {
  const { street, apartment_no, floor, city, country } = req.body;
  const account_id = req.user.user_id;

  try {
    await pool.query(
      `
      UPDATE client
      SET client_address = client_address || ROW($1, $2, $3, $4, $5)::address
      WHERE account_id = $6
      `,
      [street, apartment_no, floor, city, country, account_id]
    );

    res.status(200).json({ message: 'Address added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add address.' });
  }
};




// On the server (e.g., Node.js/Express with pg)
const getAddresses = async (req, res) => {
  console.log("here in get addresses")
  const account_id = req.user.user_id;
  console.log("here",account_id)
  try {
    const result = await pool.query(`
        SELECT json_agg(a) as addresses
        FROM client, unnest(client_address) as a
        WHERE account_id = $1
      `, [account_id]);

    res.json({ addresses: result.rows[0].addresses || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch addresses.' });
  }
};


const getUserById = async (req, res) => {

  const id = req.user.user_id
  try {
    const user = await pool.query(`SELECT * FROM client where account_id=$1`, [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "No users found" })
    }
    user_singular = user.rows[0]
    if (user_singular.profile_image) {
      user_singular.profile_image = user_singular.profile_image.replace(/\/upload\//, '/upload/c_fill,h_200,w_200/'); // Resize the image
    }


    res.status(200).json({ user: user_singular })
  }
  catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }

}

const getUserOrders = async (req, res) => {

  const id = req.user.user_id
  try {
    const orders = await pool.query(`
      SELECT 
        order_id,
        order_date,
        row_to_json(status) AS status
      FROM orders_base 
      WHERE client_id=$1
    `, [id]);

    if (orders.rows.length === 0) {

      return res.status(200).json({ message: "No orders found" })
    }

    res.status(200).json({ orders: orders.rows })
  }
  catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }

}

const updateUser = async (req, res) => {
  const id = req.user.user_id
  const { username, email, phone } = req.body

  try {
    response = await pool.query(`UPDATE client SET username=$1,email=$2,phone=$3 where account_id=$4`, [username, email, phone, id]);
    res.status(200).json({ message: 'User updated successfully' })
  }
  catch (err) {
    console.error('Error updating users:', err);
    res.status(500).json({ message: 'Server error' });
  }

}
const { Readable } = require('stream');

const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce/profile_photos' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary error:', error);
          return res.status(500).json({ message: 'Upload failed' });
        }

        const imageUrl = result.secure_url;

        try {
          const dbResult = await pool.query(
            `UPDATE client SET profile_image=$1 WHERE account_id=$2`,
            [imageUrl, userId]
          );

          if (dbResult.rowCount === 0) {
            return res.status(404).json({ message: "User not found or no change made" });
          }

          // Send back the new image URL as well
          res.status(200).json({ 
            message: "Profile image uploaded successfully",
            profile_image: imageUrl
          });

        } catch (dbErr) {
          console.error('Database error:', dbErr);
          res.status(500).json({ message: 'Database update failed' });
        }
      }
    );

    // Stream the file buffer to Cloudinary
    Readable.from(req.file.buffer).pipe(cloudinaryStream);

  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

const  getUserRefunds = async (req, res) => {
    const clientId = req.user.user_id;

    try {
        const result = await pool.query(` SELECT r.refund_id, r.order_id, r.variant_id, r.refunded_quantity, 
                   r.refund_amount, r.reason, r.status, r.requested_at, r.processed_at,
                   pb.name AS product_name, pv.color, pv.size
            FROM refunds r
            JOIN order_items oi ON r.order_id = oi.order_id AND r.variant_id = oi.variant_id
            JOIN orders_base ob ON r.order_id = ob.order_id
            JOIN product_variant pv ON r.variant_id = pv.variant_id
            JOIN product_base pb ON pv.product_id = pb.product_id
            WHERE ob.client_id = $1
            ORDER BY r.requested_at DESC
        `, [clientId]);

      

        res.json({ refunds: result.rows });
    } catch (err) {
        console.error('Error fetching user refunds:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getUserReviews = async (req, res) => {    

  const clientId = req.user.user_id;

  try {
    const result = await pool.query(`

      SELECT  r.product_id, r.rating, r.comment, r.created_at,
       pb.name AS product_name
      FROM product_reviews r
      JOIN product_base pb ON r.product_id = pb.product_id
      WHERE r.account_id = $1
      ORDER BY r.created_at DESC
    `, [clientId]);

    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
}

const deleteUserReview = async (req, res) => {
  const product_id = req.params.id;
  const client_id = req.user.user_id;

  try {
    const result = await pool.query(`
      DELETE FROM product_reviews
      WHERE product_id = $1 AND account_id = $2
      RETURNING *
    `, [product_id, client_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Review not found or already deleted' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
  getUsers,
  insertAddress,
  getAddresses,
  getUserById,
  getUserOrders,
  updateUser,
  uploadPhoto,
  getUserRefunds,
  getUserReviews,
  deleteUserReview
}
