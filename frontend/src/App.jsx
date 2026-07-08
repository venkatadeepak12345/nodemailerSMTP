import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ContactUs from './pages/ContactUs';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="app-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            🔐 SecureMail
          </Link>
          <div className="navbar-links">
            <Link to="/contact-us" className="nav-link">
              Contact Us
            </Link>
            {isAuthenticated ? (
              <>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Hi, <strong>{user?.name}</strong>
                </span>
                <button onClick={handleLogout} className="nav-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Sign In
                </Link>
                <Link to="/register" className="nav-link">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Page Content Router */}
        <main className="main-content">
          <Routes>
            {/* Protected Route */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
            />

            {/* Auth Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public Contact Route */}
            <Route path="/contact-us" element={<ContactUs />} />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
  );
}
