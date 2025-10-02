const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

// If using a hosted Postgres (like Vercel), enable SSL by setting DATABASE_SSL=true
// or when running in production. This sets rejectUnauthorized to false which is
// commonly required for some managed providers.
if (process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
