const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const actionRoutes = require('./routes/actionRoutes');

const app = express();

// Configure CORS to accept requests from our Vite client url
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'Email Service API is fully operational'
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/action', actionRoutes);

// Catch-all route handler for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler caught an unhandled exception:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'A critical internal server error occurred on the API.';
  
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
