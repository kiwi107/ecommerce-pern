import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { Link } from 'react-router-dom';
import '../login.css'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuthState } = useAuth();  


  const validateEmail = (email) => {
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (emailError || passwordError) {
      setError('Please fix the errors before submitting.');
      return;
    }

    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/loginAdmin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');

      setAuthState({
        isAuthenticated: true,
        user: data.user, 
        lastChecked: Date.now()
      });

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form shadow">
        <h2 className="text-center mb-4">Login</h2>

        {error && <div className="error-message fade-in">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${emailError ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value.toLowerCase());
              validateEmail(e.target.value);
            }}
            required
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>

        <div className="form-group mt-3">
          <label>Password</label>
          <input
            type="password"
            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
        </div>

        <button
          type="submit"
          className="login-btn mt-4"
          disabled={emailError || passwordError}
        >
          Login
        </button>

      </form>
    </div>
  );
}

export default Login;
