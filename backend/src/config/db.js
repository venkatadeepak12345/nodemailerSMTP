const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'email_service',
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed! Please ensure PostgreSQL is running and credentials in .env are correct:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database successfully.');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
