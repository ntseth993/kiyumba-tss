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
    // Return HTML page for database initialization
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Initialize Database</title>
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
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Database Initialization</h1>
        <p>Click the button below to initialize your database tables. This should be done once after deployment.</p>
        
        <button id="initBtn" onclick="initializeDatabase()">Initialize Database</button>
        
        <div id="status" style="display: none;"></div>
    </div>

    <script>
        async function initializeDatabase() {
            const btn = document.getElementById('initBtn');
            const status = document.getElementById('status');
            
            btn.disabled = true;
            btn.textContent = 'Initializing...';
            status.style.display = 'none';
            
            try {
                const response = await fetch('/api/init-db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                const result = await response.json();
                
                status.style.display = 'block';
                
                if (result.success) {
                    status.className = 'status success';
                    status.innerHTML = '<strong>✅ Success!</strong><br>Database initialized successfully. Your posts will now be visible to all users.';
                } else {
                    status.className = 'status error';
                    status.innerHTML = '<strong>❌ Error:</strong><br>' + (result.error || 'Database initialization failed');
                }
            } catch (error) {
                status.style.display = 'block';
                status.className = 'status error';
                status.innerHTML = '<strong>❌ Error:</strong><br>' + error.message;
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

      res.status(200).json({ 
        success: true, 
        message: 'Database initialized successfully' 
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Database initialization failed',
        details: error.message 
      });
    }
  }
}
