//profile
const pool=require('../config/db'); 
const cloudinary = require('../config/cloudinary'); // Import your Cloudinary configuration

const getUsers= async (req,res)=>{


    try{
        const users = await pool.query(`SELECT * FROM accounts`);
        if(users.rows.length===0){
            return res.status(404).json({message:"No users found"})
        }
        res.status(200).json({users:users.rows})
    }
    catch(err){
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error' });
    }

}


const insertAddress = async (req, res) => {
    const { street, apartment_no, floor, city, country } = req.body;
    const account_id = req.user.user_id;

    try {
        const address = `(${street},${apartment_no},${floor},${city},${country})`;

        await pool.query(
            `UPDATE client
             SET client_address = client_address || $1::address
             WHERE account_id = $2`,
            [address, account_id]
        );

        res.status(200).json({ message: 'Address added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add address.' });
    }
};
// On the server (e.g., Node.js/Express with pg)
const getAddresses = async (req, res) => {
    const  account_id  = req.user.user_id;
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
  

const getUserById= async (req,res)=>{

    const id=req.user_id
    console.log("id",id)
    try{
        const user = await pool.query(`SELECT * FROM client where account_id=$1`,[id]);
        if(user.rows.length===0){
            return res.status(404).json({message:"No users found"})
        }

        console.log("user",user.rows)

        user_singular=user.rows[0]
        if (user_singular.profile_image){
            user_singular.profile_image = user_singular.profile_image.replace(/\/upload\//, '/upload/c_fill,h_200,w_200/'); // Resize the image
        }


        res.status(200).json({user:user_singular})
    }
    catch(err){
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error' });
    }

}

const getUserOrders= async (req,res)=>{

    const id=req.user_id
    console.log("id",id)
    try{
        const orders = await pool.query(`SELECT order_id,order_date,status,total_price FROM orders where client_id=$1`,[id]);
        console.log("orders",orders.rows)
        if(orders.rows.length===0){
            console.log("no orders")
            return res.status(200).json({message:"No orders found"})
        }
        
        res.status(200).json({orders:orders.rows})
    }
    catch(err){
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Server error' });
    }

}

const updateUser= async (req,res)=>{
    const id=req.user_id
    const {username,email,phone,address}=req.body
    console.log("id",id)
    try{
           response= await pool.query(`UPDATE client SET username=$1,email=$2,phone=$3,address=$4::address where account_id=$5`,[username,email,phone,address,id]);
           res.status(200).json({message: 'User updated successfully'})
    }
    catch(err){
        console.error('Error updating users:', err);
        res.status(500).json({ message: 'Server error' });
    }

}
const { Readable } = require('stream');

const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user_id;
    console.log("userId",userId)
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

          res.status(200).json({ message: "Profile image uploaded successfully" });
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



module.exports={

    getUsers,
<<<<<<< HEAD
    insertAddress,
    getAddresses
=======
    getUserById,
    getUserOrders,
    updateUser,
    uploadPhoto
>>>>>>> e74e78db0d2f918a1e5b2fd411acc767f8e8085a
}
