import { neon } from '@neondatabase/serverless';

// Get database URL from environment variable
// Works in both Vite (browser) and Node.js (scripts)
const DATABASE_URL = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_DATABASE_URL 
  : process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('Database URL not configured. Using localStorage fallback.');
}

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Database schema initialization
export const initDatabase = async () => {
  if (!sql) return false;

  try {
    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text',
        image_url TEXT,
        images JSONB DEFAULT '[]',
        video_url TEXT,
        text_size VARCHAR(20) DEFAULT 'medium',
        visible BOOLEAN DEFAULT true,
        author VARCHAR(100) DEFAULT 'Admin',
        likes INTEGER DEFAULT 0,
        liked_by JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create applications table
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        program VARCHAR(100) NOT NULL,
        level VARCHAR(10) NOT NULL,
        education_level VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};
