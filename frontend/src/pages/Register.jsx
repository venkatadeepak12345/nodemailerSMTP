import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const response = await authAPI.register(formData.name, formData.email, formData.password);
      setAlert({ message: response.data.message, type: 'success' });
      
      // Delay slightly so they can read the success message
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email, purpose: 'email_verification' } });
      }, 1500);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Registration failed. Please check details and try again.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-auth">
      <Loader active={loading} />
      <h2 className="card-title">Create Account</h2>
      <p className="card-subtitle">Get started with your secure account setup</p>

      <Alert message={alert.message} type={alert.type} />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            className="form-input"
            type="text"
            name="name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

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
          <label className="form-label" htmlFor="password">Password</label>
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

        <button className="btn-submit" type="submit" disabled={loading}>
          Create Account
        </button>
      </form>

      <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" className="link-auth">
          Sign In
        </Link>
      </p>
    </div>
  );
}
