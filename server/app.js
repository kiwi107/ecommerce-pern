const express = require('express');

 const userRoutes = require('./routes/userRoutes');
 const productRoutes = require('./routes/productRoutes');
 const orderRoutes = require('./routes/orderRoutes');
 const paymentRoutes = require('./routes/paymentRoutes');
 const reviewRoutes = require('./routes/reviewRoutes');
const authRoutes = require('./routes/authRoutes');
 const promotionRoutes = require('./routes/promotionRoutes');



const app = express();
const port = 8000;



// Middleware to parse JSON bodies
app.use(express.json());

// Middleware for routing
app.use('/auth',authRoutes)
//app.use('/users', userRoutes);
// app.use('/products', productRoutes);
// app.use('/orders', orderRoutes);
// app.use('/payments', paymentRoutes);
// app.use('/reviews', reviewRoutes);
// app.use('/promotions', promotionRoutes);




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
