import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login.css'; // Reusing the same styles

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const validateUsername = (value) => {
    if (value.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters.');
    } else {
      setUsernameError('');
    }
  };

  const validateEmail = (value) => {
    if (!value.includes('@')) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  };

  const validateConfirmPassword = (value) => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (usernameError || emailError || passwordError || confirmPasswordError) {
      setError('Please fix the errors before submitting.');
      return;
    }

    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleRegister} className="login-form shadow">
        <h2 className="text-center mb-4">Register</h2>

        {error && <div className="error-message fade-in">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className={`form-control ${usernameError ? 'is-invalid' : ''}`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validateUsername(e.target.value);
            }}
            required
          />
          {usernameError && <div className="invalid-feedback">{usernameError}</div>}
        </div>

        <div className="form-group mt-3">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${emailError ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
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
              validateConfirmPassword(confirmPassword); // live-check match
            }}
            required
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
        </div>

        <div className="form-group mt-3">
          <label>Confirm Password</label>
          <input
            type="password"
            className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
            required
          />
          {confirmPasswordError && (
            <div className="invalid-feedback">{confirmPasswordError}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mt-4"
          disabled={
            usernameError ||
            emailError ||
            passwordError ||
            confirmPasswordError
          }
        >
          Register
        </button>

        <p className="mt-3 text-center">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
