import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (!token) {
      setAlert({ message: 'The password reset token is missing. Please request a new link.', type: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ message: 'Passwords do not match. Please verify.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword(token, formData.password);
      setAlert({ message: response.data.message, type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to reset password. The link might be expired.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-auth">
      <Loader active={loading} />
      <h2 className="card-title">New Password</h2>
      <p className="card-subtitle">Set a secure password for your account</p>

      <Alert message={alert.message} type={alert.type} />

      {!token ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            No reset token was found in the URL.
          </p>
          <Link to="/forgot-password" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Request New Link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            Save New Password
          </button>
        </form>
      )}

      <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Back to{' '}
        <Link to="/login" className="link-auth">
          Sign In
        </Link>
      </p>
    </div>
  );
}
