import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });

    try {
      const response = await authAPI.forgotPassword(email);
      setAlert({ message: response.data.message, type: 'success' });
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to dispatch password recovery request.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-auth">
      <Loader active={loading} />
      <h2 className="card-title">Reset Password</h2>
      <p className="card-subtitle">Enter your email and we'll send you a link to reset your password</p>

      <Alert message={alert.message} type={alert.type} />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            className="form-input"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          Send Reset Link
        </button>
      </form>

      <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Remember your password?{' '}
        <Link to="/login" className="link-auth">
          Sign In
        </Link>
      </p>
    </div>
  );
}
