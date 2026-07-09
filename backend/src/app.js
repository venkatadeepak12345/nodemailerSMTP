const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const actionRoutes = require('./routes/actionRoutes');

const app = express();

// Configure CORS to accept requests from our Vite client url
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'https://venkatadeepak12345.github.io'
];
if (clientUrl) {
  allowedOrigins.push(clientUrl);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching origins
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard healthcheck route
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'online',
//     timestamp: new Date().toISOString(),
//     message: 'Email Service API is fully operational'
//   });
// });
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Secure Email Service API is running'
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
