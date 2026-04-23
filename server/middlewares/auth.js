const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // For loading environment variables
const SECRET = process.env.JWT_SECRET;

// Authentication middleware function
function verifyToken(req, res, next) {
  if (req.method === 'OPTIONS') return next()
  const token = req.cookies.token;


  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; 
    next();
  });
}


// Token creation function
function createToken(user,role) {

  return jwt.sign(
    {
      
      user_id: user.account_id,
     
      username: user.username,

      role: role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

module.exports = { verifyToken, createToken };
