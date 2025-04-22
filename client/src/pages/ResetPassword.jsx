import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../login.css';

function ResetPassword() {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired reset token.');
    }
  }, [token]);

  const validatePassword = (value) => {
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting password reset:', { token});

      

    if (passwordError || password !== confirmPassword) {
      setError('Please fix the errors before submitting.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/resetPassword/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token,password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setMessage('Password successfully reset. You can now log in.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form shadow">
        <h2 className="text-center mb-4">Set New Password</h2>

        {message && <div className="alert alert-success fade-in">{message}</div>}
        {error && <div className="error-message fade-in">{error}</div>}

        <div className="form-group">
          <label>New Password</label>
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

        <div className="form-group mt-3">
          <label>Confirm Password</label>
          <input
            type="password"
            className={`form-control ${password !== confirmPassword ? 'is-invalid' : ''}`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setMatchError(password !== e.target.value ? 'Passwords do not match.' : '');
            }}
            required
          />
          {matchError && <div className="invalid-feedback">{matchError}</div>}
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-4" disabled={passwordError || matchError}>
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
