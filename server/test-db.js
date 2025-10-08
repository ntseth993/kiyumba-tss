require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    console.log('Testing database connection...');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found!');
      console.log('Please make sure your .env file contains DATABASE_URL');
      return;
    }

    const sql = neon(process.env.DATABASE_URL);

    // Simple connection test
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result[0]);

    // Create table with simpler syntax
    console.log('Creating chat_messages table...');
    await sql`DROP TABLE IF EXISTS chat_messages`;
    await sql`CREATE TABLE chat_messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER NOT NULL,
      message TEXT,
      message_type VARCHAR(20) DEFAULT 'text',
      file_url TEXT,
      file_name VARCHAR(255),
      file_type VARCHAR(50),
      file_size INTEGER,
      reply_to_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMP,
      reactions TEXT DEFAULT '[]',
      edited_at TIMESTAMP,
      deleted_at TIMESTAMP,
      deleted_by INTEGER
    )`;

    console.log('✅ chat_messages table created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();
