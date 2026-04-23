import React, { useState } from 'react';
import '../login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    if (!value.includes('@')) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      setError('Please fix the errors before submitting.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/forget_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset request failed');

      setMessage('Check your email for password reset instructions.');
      setError('');
    } catch (err) {
      setMessage('');
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form shadow">
        <h2 className="text-center mb-4">Reset Password</h2>

        {message && <div className="alert alert-success fade-in">{message}</div>}
        {error && <div className="error-message fade-in">{error}</div>}

        <div className="form-group">
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

        <button type="submit" className="btn btn-primary w-100 mt-4" disabled={emailError}>
          Send Reset Link
        </button>

        <p className="mt-3 text-center">
          <a href="/login">Back to Login</a>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
