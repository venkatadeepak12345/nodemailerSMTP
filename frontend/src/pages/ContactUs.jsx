import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });

    try {
      const response = await contactAPI.submitContactForm(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );
      setAlert({ message: response.data.message, type: 'success' });
      // Reset form fields
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to submit contact message. Please try again.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-auth" style={{ maxWidth: '600px' }}>
      <Loader active={loading} />
      <h2 className="card-title">Contact Administrator</h2>
      <p className="card-subtitle">Submit a query and our team will get in touch shortly</p>

      <Alert message={alert.message} type={alert.type} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Your Name</label>
            <input
              id="name"
              className="form-input"
              type="text"
              name="name"
              placeholder="Alice Miller"
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
              placeholder="alice@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="subject">Subject</label>
          <input
            id="subject"
            className="form-input"
            type="text"
            name="subject"
            placeholder="Feedback, bug report, query..."
            required
            value={formData.subject}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="message">Detailed Message</label>
          <textarea
            id="message"
            className="form-input"
            name="message"
            placeholder="Write your query here..."
            required
            rows={5}
            style={{ resize: 'vertical', minHeight: '100px' }}
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          Send Message
        </button>
      </form>

      <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Back to{' '}
        <Link to="/login" className="link-auth">
          Sign In
        </Link>
      </p>
    </div>
  );
}
