
const pool = require('../config/db'); // Adjust the path to your db.js file
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT token generation
const dotenv = require('dotenv'); // For loading environment variables
const {authenticateToken,createToken}=require('../middlewares/auth')
const crypto=require('crypto'); // For generating random tokens
const mailer = require('../utils/Mailer/emails'); // For sending emails (if you have a mailer utility)
const { sendEmail, EMAIL_SUBJECTS } = mailer; 

//login and registeration

const sayHello = (req,res)=>{

    res.send("hello world")

}
//email
//username
//password

const register = async (req, res) => {
    const { email, username, password } = req.body;
  
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
  
    try {
      // Check if email already exists
      const result = await pool.query(
        'SELECT 1 FROM accounts WHERE email = $1 LIMIT 1',
        [email]
      );
  
      if (result.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert new user into the database
      const insertUser = await pool.query(
        'INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3) RETURNING account_id, username, email',
        [username, hashedPassword, email]
      );
  
      const user = insertUser.rows[0];
  
      // Create JWT token using the generateToken function
      const token = createToken(user);
  
      // Set the token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000 // Cookie expiry time (1 day)
      });
  
      // Return the user info without the password
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.account_id,
          username: user.username,
          email: user.email
        }
      });
  
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }



const login =async(req,res)=>{
   
        const { email, password } = req.body;
      
        if (!email || !password) {
          return res.status(400).json({ message: 'Please fill all fields' });
        }
      
        try {
          // Check if the user exists with the given email
          const result = await pool.query(
            'SELECT * FROM accounts WHERE email = $1 LIMIT 1',
            [email]
          );
      
          if (result.rows.length === 0) {
            return res.status(400).json({ message: 'User does not exist' });
          }
      
          const user = result.rows[0];
      
          // Compare the hashed password from DB with the entered password
          const isPasswordValid = await bcrypt.compare(password, user.password);
      
          if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
      
          // Create JWT token
          const token = createToken(user);
      
          // Set the token in HTTP-only cookie
          res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // Cookie expiry time (1 day)
          });
      
          // Return the user info without the password
          res.status(200).json({
            message: 'Login successful',
            user: {
              id: user.account_id,
              username: user.username,
              email: user.email
            }
          });
      
        } catch (error) {
          console.error("Error during login:", error);
          res.status(500).json({ message: 'Internal server error' });
        }
      };


      
    const logout = async (req, res) => {
        res.clearCookie('token'); // Clear the cookie
        res.status(200).json({ message: 'Logged out successfully' });
      };




    
    const forget_password = async (req, res) => {

        const{email}=req.body;

        if(!email){
            return res.status(400).json({message:"Please fill all fields"})
        }   

        try{
            const result = await pool.query(
                'SELECT * FROM accounts WHERE email = $1 LIMIT 1',
                [email]
              );
        
              if (result.rows.length === 0) {
                return res.status(400).json({ message: 'User does not exist' });
              }

              const user=result.rows[0];
              
              const token=crypto.randomBytes(32).toString('hex');

              const expiryDate=new Date(Date.now()+3600000); //1 hour from now
              
              await pool.query('UPDATE accounts SET reset_token=$1 , reset_token_expiry =$2 WHERE email=$3',[token,expiryDate,email]);

              //send email to user with the token

                const resetLink=`${process.env.CLIENT_URL}/reset-password/${token}`;

                const subject=mailer.EMAIL_SUBJECTS.PASSWORD_RESET;
                const text=`You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`;
                const template='reset_password'; // Example template name
                await sendEmail({
                    to:email,
                    subject,
                    template,
                    context:{
                        name:user.username,
                        resetLink:resetLink
                    }
                });


              res.status(200).json({message:"Reset password link sent to your email"})
        }
        catch(err){
            console.error("Error during forget password:", err);
            res.status(500).json({ message: "Internal server error" });
        }

      }


      const resetPassword = async (req, res) => {
        const { token, newPassword } = req.body;
      
        try {
          
          
            // 1. Find user by reset token
            const result = await pool.query(
              'SELECT * FROM accounts WHERE reset_token = $1',
              [token]
            );

            if (result.rows.length === 0) {
              return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            const user = result.rows[0];
          
         
         
      
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await pool.query(
            'UPDATE accounts SET password = $1, reset_token = NULL WHERE account_id = $2',
            [hashedPassword, user.account_id]
          );
      
          res.status(200).json({ message: 'Password reset successful' });
      
        } catch (err) {
          console.error('Reset error:', err);
          res.status(400).json({ message: 'Invalid or expired token' });
        }
      };


  
module.exports = {
    sayHello,
    register,
    login,
    logout,
    forget_password,
    resetPassword
}