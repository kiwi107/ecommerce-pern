import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword'; 
import ForgetPassword from './pages/ForgetPassword';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} /> 
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* token from URL */}
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
