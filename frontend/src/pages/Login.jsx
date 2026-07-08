import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.data.requiresOtp) {
        // Multi-Factor Login OTP path
        setAlert({ message: response.data.message, type: 'success' });
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: formData.email, purpose: 'login_otp' } });
        }, 1000);
      } else {
        // Direct entry callback (if OTP bypass configured, or user already verified)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setAlert({ message: 'Login successful!', type: 'success' });
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      const status = error.response?.status;
      const errMsg = error.response?.data?.error || 'Login failed. Please check credentials.';

      // Check if the user is registered but email verification is pending
      if (status === 403 && error.response?.data?.requiresVerification) {
        setAlert({ message: errMsg, type: 'error' });
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: formData.email, purpose: 'email_verification' } });
        }, 2000);
      } else {
        setAlert({ message: errMsg, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-auth">
      <Loader active={loading} />
      <h2 className="card-title">Sign In</h2>
      <p className="card-subtitle">Access your secure communications dashboard</p>

      <Alert message={alert.message} type={alert.type} />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            className="form-input"
            type="email"
            name="email"
            placeholder="name@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="link-auth" style={{ fontSize: '12px', marginBottom: '8px' }}>
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            className="form-input"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          Sign In
        </button>
      </form>

      <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" className="link-auth">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
