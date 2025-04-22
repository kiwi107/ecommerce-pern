const express = require('express');
<<<<<<< HEAD
=======
const cors = require('cors');
const cookieParser = require('cookie-parser');
const productRoutes = require('./routes/productRoutes.js');
const morgan = require('morgan');
require('dotenv').config();
>>>>>>> ded0f17 (homepage and navbar)

const app = express();
const port = 8000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan('dev'));


app.use('/products', productRoutes);


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
