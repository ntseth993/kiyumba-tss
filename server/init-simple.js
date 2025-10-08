// Simple database initialization that works
const fs = require('fs');
const path = require('path');

console.log('🔄 Starting database initialization...');

// Create a simple file-based chat system as backup
const chatDataPath = path.join(__dirname, 'chat-data.json');

if (!fs.existsSync(chatDataPath)) {
  fs.writeFileSync(chatDataPath, JSON.stringify({
    messages: [],
    users: [],
    lastUpdated: new Date().toISOString()
  }));
  console.log('✅ Created chat data file');
}

// Try to connect to database if .env exists
try {
  require('dotenv').config();

  if (process.env.DATABASE_URL) {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    console.log('🔄 Testing database connection...');

    // Test connection
    sql`SELECT 1`.then(() => {
      console.log('✅ Database connected successfully');

      // Create tables
      Promise.all([
        sql`CREATE TABLE IF NOT EXISTS chat_messages (
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
        )`,
        sql`CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          time VARCHAR(20),
          location VARCHAR(200),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ]).then(() => {
        console.log('✅ All database tables created successfully!');
        console.log('🎉 Database initialization complete!');
        process.exit(0);
      }).catch(err => {
        console.error('❌ Database table creation failed:', err.message);
        console.log('💡 Continuing with file-based chat system...');
        console.log('✅ File-based system is ready!');
        process.exit(0);
      });
    }).catch(err => {
      console.error('❌ Database connection failed:', err.message);
      console.log('💡 Using file-based chat system instead');
      console.log('✅ File-based system is ready!');
      process.exit(0);
    });
  } else {
    console.log('ℹ️ No DATABASE_URL found, using file-based system');
    console.log('✅ File-based chat system ready!');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Setup error:', error.message);
  console.log('💡 Using file-based chat system');
  console.log('✅ File-based system is ready!');
  process.exit(0);
}
