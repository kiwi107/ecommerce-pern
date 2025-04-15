const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // For loading environment variables
const SECRET = process.env.JWT_SECRET;

// Authentication middleware function
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Attach decoded user info to request
    next();
  });
}

// Token creation function
function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

module.exports = { authenticateToken, createToken };
