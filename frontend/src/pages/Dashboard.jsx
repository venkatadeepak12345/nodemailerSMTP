import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { actionAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [actionName, setActionName] = useState('Product Purchase Confirmation');

  // Load user session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  // Mock data templates based on selector selection
  const getActionDetails = () => {
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const referenceCode = `REF-${Date.now().toString().slice(-6)}`;

    if (actionName === 'Product Purchase Confirmation') {
      return {
        transactionId,
        referenceCode,
        items: [
          { name: 'Developer Pro Workspace License', quantity: 1, price: 89.00 },
          { name: 'Enterprise API Add-on', quantity: 1, price: 15.00 }
        ],
        subtotal: 104.00,
        tax: 10.40,
        total: 114.40
      };
    } else if (actionName === 'Account Plan Upgrade') {
      return {
        transactionId,
        referenceCode,
        items: [
          { name: 'SaaS Business Growth Plan (Annual Upgrade)', quantity: 1, price: 349.00 }
        ],
        subtotal: 349.00,
        tax: 34.90,
        total: 383.90
      };
    } else {
      // Security Backup
      return {
        transactionId,
        referenceCode,
        backupSize: '2.4 GB',
        encryptionType: 'AES-256',
        completedAt: new Date().toLocaleString()
      };
    }
  };

  const handleTriggerEmail = async () => {
    setLoading(true);
    setAlert({ message: '', type: '' });

    try {
      const details = getActionDetails();
      const response = await actionAPI.sendActionConfirmation(actionName, details);
      
      setAlert({
        message: `${response.data.message} Check the backend terminal for the Ethereal preview link!`,
        type: 'success'
      });
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to dispatch confirmation email.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-grid">
      <Loader active={loading} />

      {/* Account Info card */}
      <div className="dashboard-card">
        <h2 className="dashboard-title">Secure Portal Dashboard</h2>
        <Alert message={alert.message} type={alert.type} />
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
          Welcome back! You are logged in using a secure JSON Web Token. You can test active email integrations below.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="info-row">
            <span className="info-label">Display Name</span>
            <span className="info-value">{user.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Registered Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Verification Status</span>
            <span className="info-value" style={{ color: 'var(--success)', fontWeight: '600' }}>
              VERIFIED
            </span>
          </div>
          <div className="info-row" style={{ borderBottom: 'none' }}>
            <span className="info-label">Session Expire</span>
            <span className="info-value" style={{ color: 'var(--text-muted)' }}>7 Days</span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="btn-submit" 
          style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', marginTop: '30px' }}
        >
          Sign Out of Account
        </button>
      </div>

      {/* Interactive Actions Card */}
      <div className="dashboard-card">
        <h3 className="dashboard-title">Trigger Notifications</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
          Choose a transactional action layout to send a responsive confirmation email directly to your account.
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="action-select">Email Theme/Action</label>
          <select
            id="action-select"
            className="form-input"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)' }}
          >
            <option value="Product Purchase Confirmation">Product Purchase Receipt</option>
            <option value="Account Plan Upgrade">Subscription Upgrade</option>
            <option value="System Security Backup Created">Security Action Backup</option>
          </select>
        </div>

        <button 
          onClick={handleTriggerEmail} 
          className="btn-submit" 
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          Send Confirmation Email
        </button>

        <div style={{ marginTop: '24px', backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Developer Tip:</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            We've set up <strong>Ethereal Mail</strong> as our development SMTP. Submitting this form outputs a web preview link directly in the backend terminal logs!
          </p>
        </div>
      </div>
    </div>
  );
}
