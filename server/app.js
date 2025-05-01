const express = require('express');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const { verifyToken } = require('./middlewares/auth'); // Import the verifyToken middleware
require('dotenv').config();

const app = express();
const port = 8000;


const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authRoutes = require('./routes/authRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const adminRoutes=require('./routes/adminRoutes');

app.use(morgan('dev'));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, //allow cookies and auth headers to be sent
}));
app.use(cookieParser());
app.use(express.json());
// Middleware for routing
app.use('/auth',authRoutes)
app.use('/admin',adminRoutes)
app.use('/users',verifyToken, userRoutes);
app.use('/products', productRoutes);
app.use('/orders',verifyToken, orderRoutes);
// app.use('/payments', paymentRoutes);
// app.use('/reviews', reviewRoutes);
app.use('/promotions',verifyToken, promotionRoutes);



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
