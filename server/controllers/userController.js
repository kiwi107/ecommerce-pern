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

module.exports={

    getUsers
}
