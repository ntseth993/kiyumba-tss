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
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            background-color: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        button { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px;
        }
        button:hover { background: #0056b3; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        .success { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 4px; 
            margin-top: 20px; 
            border: 1px solid #c3e6cb;
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 15px; 
            border-radius: 4px; 
            margin-top: 20px; 
            border: 1px solid #f5c6cb;
        }
        .loading { 
            background: #d1ecf1; 
            color: #0c5460; 
            padding: 15px; 
            border-radius: 4px; 
            margin-top: 20px; 
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Database Setup</h1>
        <p>Click the button below to initialize your database tables. This will create all necessary tables for your app.</p>
        <button id="setupBtn" onclick="setupDatabase()">Initialize Database</button>
        <div id="result"></div>
    </div>
    <script>
        async function setupDatabase() {
            const btn = document.getElementById('setupBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            btn.textContent = 'Initializing...';
            result.innerHTML = '<div class="loading">🔄 Setting up database tables...</div>';
            
            try {
                const response = await fetch('/api/init-db', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    result.innerHTML = '<div class="success">✅ Database initialized successfully!<br>All tables created. Your app is ready to use!</div>';
                } else {
                    result.innerHTML = '<div class="error">❌ Error: ' + (data.error || 'Database initialization failed') + '</div>';
                }
            } catch (error) {
                result.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Initialize Database';
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

      await sql`CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time VARCHAR(20),
        location VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        level VARCHAR(20),
        program VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS teacher_subjects (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(teacher_id, subject_id, class_id)
      )`;

      await sql`CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL,
        subject VARCHAR(100),
        class_name VARCHAR(100),
        file_url TEXT NOT NULL,
        file_name VARCHAR(255),
        due_date DATE,
        total_marks INTEGER,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        target_roles TEXT[] NOT NULL,
        link VARCHAR(255),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )`;

      await sql`CREATE TABLE IF NOT EXISTS chat_messages (
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
