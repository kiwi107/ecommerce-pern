
const pool = require('../config/db'); // Adjust the path to your db.js file
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT token generation
const dotenv = require('dotenv'); // For loading environment variables
const {authenticateToken,createToken}=require('../middlewares/auth')


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
        'INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
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
          id: user.id,
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
              id: user.id,
              username: user.username,
              email: user.email
            }
          });
      
        } catch (error) {
          console.error("Error during login:", error);
          res.status(500).json({ message: 'Internal server error' });
        }
      };

  
module.exports = {
    sayHello,
    register,
    login
}