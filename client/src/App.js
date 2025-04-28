import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgetPassword from './pages/ForgetPassword';
import Navbar from './components/Navbar';
import ProductDetails from './pages/ProductDetails';
import { CartProvider } from './contexts/CartContext';
import Cart from './pages/Cart';
import Profile from './pages/Profile'; 
import ProtectedRoute from './components/ProtectedRoute'; 


function App() {
  return (
    <CartProvider>

      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* token from URL */}
          <Route path="/product/:id" element={<ProductDetails />} /> {/* Product ID from URL */}
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/cart" element={<Cart />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </CartProvider>

  );
}

export default App;
