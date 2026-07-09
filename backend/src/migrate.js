const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  const client = process.env.DATABASE_URL
    ? new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      })
    : new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_DATABASE || 'email_service',
        ssl: (process.env.RENDER || process.env.NODE_ENV === 'production')
          ? { rejectUnauthorized: false }
          : false
      });

  try {
    await client.connect();
    console.log('⚡ Connected to database:', process.env.DB_DATABASE);

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    console.log('📜 Reading SQL schema from:', schemaPath);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️ Executing SQL script...');
    await client.query(schemaSql);
    console.log('✅ Database migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration execution failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
