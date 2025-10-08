require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function createChatTable() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env file');
      console.log('Please check your .env file contains DATABASE_URL');
      return;
    }

    console.log('🔄 Connecting to database...');
    const sql = neon(process.env.DATABASE_URL);

    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');

    // Create chat_messages table
    console.log('🔄 Creating chat_messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        message_type VARCHAR(20) DEFAULT 'text',
        file_url TEXT,
        file_name VARCHAR(255),
        file_type VARCHAR(50),
        file_size INTEGER,
        reply_to_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        reactions JSONB DEFAULT '[]'::jsonb,
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      )
    `;

    console.log('✅ chat_messages table created successfully!');

    // Also create events table if missing
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time VARCHAR(20),
        location VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ events table ready');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createChatTable();
