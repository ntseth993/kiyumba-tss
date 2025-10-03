import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return a simple HTML page
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Database Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 30px; border-radius: 8px; }
        button { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-top: 20px; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Database Setup</h1>
        <p>Click the button below to initialize your database tables.</p>
        <button onclick="setupDatabase()">Initialize Database</button>
        <div id="result"></div>
    </div>
    <script>
        async function setupDatabase() {
            const result = document.getElementById('result');
            result.innerHTML = 'Initializing...';
            
            try {
                const response = await fetch('/api/init-db', { method: 'POST' });
                const data = await response.json();
                
                if (data.success) {
                    result.innerHTML = '<div class="success">✅ Database initialized successfully!</div>';
                } else {
                    result.innerHTML = '<div class="error">❌ Error: ' + data.error + '</div>';
                }
            } catch (error) {
                result.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    return;
  }

  if (req.method === 'POST') {
    try {
      // Create all tables
      await sql`CREATE TABLE IF NOT EXISTS posts (
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
      )`;

      await sql`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        program VARCHAR(100) NOT NULL,
        level VARCHAR(10) NOT NULL,
        education_level VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        author_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_name VARCHAR(100),
        sender_email VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      res.status(200).json({ 
        success: true, 
        message: 'Database initialized successfully with all tables!' 
      });
    } catch (error) {
      console.error('Database setup error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Database setup failed: ' + error.message 
      });
    }
  }
}
