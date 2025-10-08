require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function initChatTable() {
  try {
    console.log('Creating chat_messages table...');
    
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

initChatTable();
