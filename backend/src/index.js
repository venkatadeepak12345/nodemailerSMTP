const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Secure Email Service API is running in ${process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );

  console.log('🔗 Health endpoint: /health');
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error(
    '❌ Unhandled Promise Rejection:',
    err.message
  );

  server.close(() => process.exit(1));
});

// Handle system shutdown signals
process.on('SIGTERM', () => {
  console.log(
    '👋 SIGTERM received. Shutting down server gracefully.'
  );

  server.close(() => {
    console.log('Process terminated.');
  });
});
