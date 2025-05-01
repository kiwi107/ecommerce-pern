//profile
const pool=require('../config/db'); 

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
  


module.exports={

    getUsers,
    insertAddress,
    getAddresses
}
