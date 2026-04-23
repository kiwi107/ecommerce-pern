import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgetPassword from './pages/ForgetPassword';
import Navbar from './components/Navbar';
import ProductDetails from './pages/ProductDetails';
import { CartProvider } from './contexts/CartContext';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import CheckoutPage from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import Admin from './pages/Admin';
import ProductsPage from './pages/ProductsPage';


// Wrapper component to conditionally render Navbar
function AppWithNavbar() {
  const location = useLocation();

  // List of routes where the Navbar should be hidden
  const noNavbarPaths = ['/admin', '/login', '/register'];

  return (
    <>
      {/* Conditionally render Navbar */}
      {!noNavbarPaths.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order/:order_id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:gender" element={<ProductsPage />} />
        <Route path="/products/category/:onlyCategory" element={<ProductsPage />} />
        <Route path="/products/:gender/:category" element={<ProductsPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        {/* Include AppWithNavbar to manage Navbar visibility */}
        <AppWithNavbar />
      </Router>
    </CartProvider>
  );
}

export default App;
