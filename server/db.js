const { Pool } = require('pg');
const path = require('path');
// Load .env from the server folder explicitly to avoid issues when cwd differs
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Fallback: if dotenv didn't set DATABASE_URL (sometimes happens with special
// characters), try to read the file manually and extract the DATABASE_URL line.
if (!process.env.DATABASE_URL) {
  try {
    const fs = require('fs');
    // Try reading as utf8 first
    let envRaw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    // If file contains null bytes it was likely saved as UTF-16; read as utf16le
    if (envRaw.indexOf('\u0000') !== -1) {
      envRaw = fs.readFileSync(path.join(__dirname, '.env'), 'utf16le');
    }
    // Remove BOM and control characters at the start which can break parsing
    envRaw = envRaw.replace(/^[\u0000-\u001F\uFEFF]+/, '');
    // Split into lines and set any KEY=VALUE pairs we find
    const lines = envRaw.split(/\r?\n/);
    const parsedKeys = [];
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.substring(0, idx).trim();
      let value = line.substring(idx + 1).trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) process.env[key] = value;
      parsedKeys.push(key);
    }
    console.log('DB DEBUG: parsed keys from .env =', parsedKeys);
  } catch (e) {
    // ignore read errors
  }
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

// If using a hosted Postgres (like Vercel), enable SSL by setting DATABASE_SSL=true
// or when running in production. This sets rejectUnauthorized to false which is
// commonly required for some managed providers.
if (process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Debug: print whether DATABASE_URL is present and ssl setting (temporary)
try {
  if (process.env.DATABASE_URL) {
    const parsed = new URL(process.env.DATABASE_URL);
    console.log('DB DEBUG: host=', parsed.hostname, 'port=', parsed.port || '(default)', 'sslEnabled=', !!poolConfig.ssl);
  } else {
    console.log('DB DEBUG: no DATABASE_URL present');
  }
} catch (e) {
  console.log('DB DEBUG: error parsing DATABASE_URL', e.message);
}

const pool = new Pool(poolConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
