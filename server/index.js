const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import Neon database (fallback to pg for legacy endpoints)
let sql;
try {
  const { neon } = require('@neondatabase/serverless');
  sql = neon(process.env.DATABASE_URL);
  console.log('✅ Using Neon serverless driver');
} catch (err) {
  const db = require('./db');
  // Wrapper to make pg queries work like neon
  sql = async (strings, ...values) => {
    const query = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] !== undefined ? `$${i + 1}` : '');
    }, '');
    const result = await db.query(query, values);
    return result.rows;
  };
  console.log('✅ Using PostgreSQL driver');
}

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM applications ORDER BY applied_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create application
app.post('/api/applications', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, program, level, address, date_of_birth, previous_school, reason } = req.body;
    const result = await db.query(
      `INSERT INTO applications (first_name, last_name, email, phone, program, level, address, date_of_birth, previous_school, reason, status, applied_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending', NOW()) RETURNING *`,
      [first_name, last_name, email, phone, program, level, address, date_of_birth, previous_school, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update application status
app.put('/api/applications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const result = await db.query('UPDATE applications SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM applications WHERE id=$1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==================== SUBJECTS ====================
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await sql`SELECT * FROM subjects ORDER BY name ASC`;
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const result = await sql`INSERT INTO subjects (name, code, description) VALUES (${name}, ${code}, ${description}) RETURNING *`;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CLASSES ====================
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await sql`SELECT * FROM classes ORDER BY name ASC`;
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const { name, level, program } = req.body;
    const result = await sql`INSERT INTO classes (name, level, program) VALUES (${name}, ${level}, ${program}) RETURNING *`;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TEACHER SUBJECTS ====================
app.get('/api/teacher-subjects', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    if (teacher_id) {
      const result = await sql`
        SELECT ts.*, s.name as subject_name, s.code as subject_code, c.name as class_name, c.level, c.program
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        JOIN classes c ON ts.class_id = c.id
        WHERE ts.teacher_id = ${teacher_id}
      `;
      res.json(result);
    } else {
      const result = await sql`SELECT * FROM teacher_subjects`;
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teacher-subjects', async (req, res) => {
  try {
    const { teacher_id, subject_id, class_id } = req.body;
    const result = await sql`INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES (${teacher_id}, ${subject_id}, ${class_id}) RETURNING *`;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teacher-subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM teacher_subjects WHERE id=${id}`;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ASSESSMENTS ====================
app.get('/api/assessments', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    if (teacher_id) {
      const result = await sql`SELECT * FROM assessments WHERE teacher_id = ${teacher_id} ORDER BY created_at DESC`;
      res.json(result);
    } else {
      const result = await sql`SELECT * FROM assessments ORDER BY created_at DESC`;
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessments', async (req, res) => {
  try {
    const { teacher_id, title, description, type, subject, class_name, file_url, file_name, due_date, total_marks } = req.body;
    const result = await sql`
      INSERT INTO assessments (teacher_id, title, description, type, subject, class_name, file_url, file_name, due_date, total_marks)
      VALUES (${teacher_id}, ${title}, ${description}, ${type}, ${subject}, ${class_name}, ${file_url}, ${file_name}, ${due_date}, ${total_marks})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== NOTIFICATIONS ====================
app.get('/api/notifications', async (req, res) => {
  try {
    const { role } = req.query;
    if (role) {
      const result = await sql`
        SELECT * FROM notifications
        WHERE ${role} = ANY(target_roles) AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
      `;
      res.json(result);
    } else {
      const result = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await sql`
      SELECT * FROM notifications
      WHERE (target_user_id = ${userId} OR ${userId} = ANY(target_roles) OR target_user_id IS NULL)
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;
    res.json(result);
  } catch (err) {
    console.error('User notifications error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE (target_user_id = ${userId} OR ${userId} = ANY(target_roles) OR target_user_id IS NULL)
      AND is_read = false
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    res.json(parseInt(result[0].count));
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = ${id}`;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await sql`
      UPDATE notifications
      SET is_read = true, read_at = NOW()
      WHERE (target_user_id = ${userId} OR ${userId} = ANY(target_roles) OR target_user_id IS NULL)
      AND is_read = false
    `;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM notifications WHERE id = ${id}`;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { title, message, type, priority, target_user_id, target_roles, action_url, expires_at } = req.body;

    const result = await sql`
      INSERT INTO notifications (title, message, type, priority, target_user_id, target_roles, action_url, expires_at)
      VALUES (${title}, ${message}, ${type || 'info'}, ${priority || 'medium'}, ${target_user_id || null}, ${target_roles || null}, ${action_url || null}, ${expires_at || null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MEETINGS ====================
// Get all meetings
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await sql`SELECT * FROM meetings ORDER BY scheduled_time DESC`;
    res.json(meetings);
  } catch (err) {
    console.error('Meetings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get meeting by ID
app.get('/api/meetings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meetings = await sql`SELECT * FROM meetings WHERE id = ${id}`;

    if (meetings.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(meetings[0]);
  } catch (err) {
    console.error('Meeting error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create meeting
app.post('/api/meetings', async (req, res) => {
  try {
    const {
      title,
      description,
      scheduled_time,
      duration,
      platform,
      meeting_type,
      host_id,
      host_name,
      host_email,
      max_participants,
      join_url,
      meeting_code,
      password,
      settings
    } = req.body;

    const result = await sql`
      INSERT INTO meetings (title, description, scheduled_time, duration, platform, meeting_type, host_id, host_name, host_email, max_participants, join_url, meeting_code, password, settings)
      VALUES (${title}, ${description}, ${scheduled_time}, ${duration}, ${platform}, ${meeting_type}, ${host_id}, ${host_name}, ${host_email}, ${max_participants || null}, ${join_url || null}, ${meeting_code || null}, ${password || null}, ${settings || null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update meeting
app.put('/api/meetings', async (req, res) => {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }

    // Build update query parts
    const updates = [];
    const values = [];

    if (updateData.title !== undefined) {
      updates.push('title = $' + (values.length + 1));
      values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      updates.push('description = $' + (values.length + 1));
      values.push(updateData.description);
    }
    if (updateData.scheduled_time !== undefined) {
      updates.push('scheduled_time = $' + (values.length + 1));
      values.push(updateData.scheduled_time);
    }
    if (updateData.duration !== undefined) {
      updates.push('duration = $' + (values.length + 1));
      values.push(updateData.duration);
    }
    if (updateData.platform !== undefined) {
      updates.push('platform = $' + (values.length + 1));
      values.push(updateData.platform);
    }
    if (updateData.meeting_type !== undefined) {
      updates.push('meeting_type = $' + (values.length + 1));
      values.push(updateData.meeting_type);
    }
    if (updateData.host_id !== undefined) {
      updates.push('host_id = $' + (values.length + 1));
      values.push(updateData.host_id);
    }
    if (updateData.host_name !== undefined) {
      updates.push('host_name = $' + (values.length + 1));
      values.push(updateData.host_name);
    }
    if (updateData.host_email !== undefined) {
      updates.push('host_email = $' + (values.length + 1));
      values.push(updateData.host_email);
    }
    if (updateData.max_participants !== undefined) {
      updates.push('max_participants = $' + (values.length + 1));
      values.push(updateData.max_participants);
    }
    if (updateData.join_url !== undefined) {
      updates.push('join_url = $' + (values.length + 1));
      values.push(updateData.join_url);
    }
    if (updateData.meeting_code !== undefined) {
      updates.push('meeting_code = $' + (values.length + 1));
      values.push(updateData.meeting_code);
    }
    if (updateData.password !== undefined) {
      updates.push('password = $' + (values.length + 1));
      values.push(updateData.password);
    }
    if (updateData.settings !== undefined) {
      updates.push('settings = $' + (values.length + 1));
      values.push(JSON.stringify(updateData.settings));
    }
    if (updateData.status !== undefined) {
      updates.push('status = $' + (values.length + 1));
      values.push(updateData.status);
    }
    if (updateData.participants !== undefined) {
      updates.push('participants = $' + (values.length + 1));
      values.push(JSON.stringify(updateData.participants));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = updates.join(', ') + ', updated_at = NOW()';

    const query = `
      UPDATE meetings
      SET ${setClause}
      WHERE id = $${updates.length + 1}
      RETURNING *
    `;

    const result = await sql.unsafe(query, [...values, id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update meeting error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete meeting
app.delete('/api/meetings', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }

    const result = await sql`DELETE FROM meetings WHERE id = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error('Delete meeting error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start meeting
app.patch('/api/meetings/:id/start', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      UPDATE meetings
      SET status = 'active', started_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Start meeting error:', err);
    res.status(500).json({ error: err.message });
  }
});

// End meeting
app.patch('/api/meetings/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      UPDATE meetings
      SET status = 'ended', ended_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('End meeting error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== EVENTS ====================
app.get('/api/events', async (req, res) => {
  try {
    const events = await sql`SELECT * FROM events ORDER BY date ASC`;
    res.json(events);
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;
    const result = await sql`
      INSERT INTO events (title, description, date, time, location)
      VALUES (${title}, ${description}, ${date}, ${time || null}, ${location || null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location } = req.body;
    const result = await sql`
      UPDATE events 
      SET title = ${title}, description = ${description}, date = ${date}, 
          time = ${time}, location = ${location}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM events WHERE id = ${id}`;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TEACHER PERFORMANCE ====================
app.get('/api/teacher-performance', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    if (teacher_id) {
      const result = await sql`
        SELECT tp.*, u.name as teacher_name
        FROM teacher_performance tp
        JOIN users u ON tp.teacher_id = u.id
        WHERE tp.teacher_id = ${teacher_id}
        ORDER BY tp.date DESC
      `;
      res.json(result);
    } else {
      const result = await sql`
        SELECT tp.*, u.name as teacher_name
        FROM teacher_performance tp
        JOIN users u ON tp.teacher_id = u.id
        ORDER BY tp.date DESC
      `;
      res.json(result);
    }
  } catch (err) {
    console.error('Teacher performance error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teacher-performance', async (req, res) => {
  try {
    const { teacher_id, activity_type, subject, class_name, description, rating } = req.body;
    const result = await sql`
      INSERT INTO teacher_performance (teacher_id, activity_type, subject, class_name, description, rating)
      VALUES (${teacher_id}, ${activity_type}, ${subject || null}, ${class_name || null}, ${description || null}, ${rating || null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== STAFF ROLES ====================
app.get('/api/staff-roles', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const role = await sql`SELECT * FROM staff_roles WHERE user_id = ${user_id}`;
    if (role.length === 0) {
      return res.status(404).json({ error: 'No role assigned' });
    }
    res.json(role[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff-roles', async (req, res) => {
  try {
    const { user_id, role_type, department, admin_id } = req.body;
    if (!admin_id) {
      return res.status(401).json({ error: 'Unauthorized: Admin ID required' });
    }
    const admin = await sql`SELECT role FROM users WHERE id = ${admin_id}`;
    if (admin.length === 0 || admin[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admins can assign staff roles' });
    }
    const result = await sql`
      INSERT INTO staff_roles (user_id, role_type, department, created_at, updated_at)
      VALUES (${user_id}, ${role_type}, ${department || null}, NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET role_type = ${role_type}, department = ${department || null}, updated_at = NOW()
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DATABASE INITIALIZATION ====================
// Initialize database tables
app.post('/api/init-db', async (req, res) => {
  try {
    console.log('🔄 Starting database initialization...');

    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      return res.status(400).json({
        success: false,
        error: 'No database URL configured. Please set DATABASE_URL in your .env file.'
      });
    }

    // Test database connection first
    try {
      await sql`SELECT 1`;
      console.log('✅ Database connected successfully');
    } catch (connError) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed: ' + connError.message
      });
    }

    // Create all necessary tables
    const tables = [];

    // Posts table
    try {
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
      tables.push('posts');
      console.log('✅ Created posts table');
    } catch (err) {
      console.error('❌ Error creating posts table:', err.message);
    }

    // Users table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'student',
          avatar TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('users');
      console.log('✅ Created users table');
    } catch (err) {
      console.error('❌ Error creating users table:', err.message);
    }

    // Applications table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          program VARCHAR(100) NOT NULL,
          level VARCHAR(10) NOT NULL,
          address TEXT,
          date_of_birth DATE,
          previous_school VARCHAR(200),
          reason TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('applications');
      console.log('✅ Created applications table');
    } catch (err) {
      console.error('❌ Error creating applications table:', err.message);
    }

    // Subjects table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS subjects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(20) UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('subjects');
      console.log('✅ Created subjects table');
    } catch (err) {
      console.error('❌ Error creating subjects table:', err.message);
    }

    // Classes table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS classes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          level VARCHAR(20),
          program VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('classes');
      console.log('✅ Created classes table');
    } catch (err) {
      console.error('❌ Error creating classes table:', err.message);
    }

    // Teacher subjects table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS teacher_subjects (
          id SERIAL PRIMARY KEY,
          teacher_id INTEGER NOT NULL,
          subject_id INTEGER NOT NULL,
          class_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id),
          FOREIGN KEY (subject_id) REFERENCES subjects(id),
          FOREIGN KEY (class_id) REFERENCES classes(id)
        )
      `;
      tables.push('teacher_subjects');
      console.log('✅ Created teacher_subjects table');
    } catch (err) {
      console.error('❌ Error creating teacher_subjects table:', err.message);
    }

    // Meetings table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS meetings (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          scheduled_time TIMESTAMP NOT NULL,
          duration INTEGER DEFAULT 60,
          platform VARCHAR(50),
          meeting_type VARCHAR(50),
          host_id INTEGER,
          host_name VARCHAR(100),
          host_email VARCHAR(255),
          max_participants INTEGER,
          join_url TEXT,
          meeting_code VARCHAR(100),
          password VARCHAR(100),
          settings JSONB,
          status VARCHAR(20) DEFAULT 'scheduled',
          participants JSONB DEFAULT '[]',
          started_at TIMESTAMP,
          ended_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('meetings');
      console.log('✅ Created meetings table');
    } catch (err) {
      console.error('❌ Error creating meetings table:', err.message);
    }

    // Events table
    try {
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
      tables.push('events');
      console.log('✅ Created events table');
    } catch (err) {
      console.error('❌ Error creating events table:', err.message);
    }

    // Notifications table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          message TEXT,
          type VARCHAR(20) DEFAULT 'info',
          priority VARCHAR(20) DEFAULT 'medium',
          target_user_id INTEGER,
          target_roles JSONB,
          action_url TEXT,
          is_read BOOLEAN DEFAULT false,
          read_at TIMESTAMP,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('notifications');
      console.log('✅ Created notifications table');
    } catch (err) {
      console.error('❌ Error creating notifications table:', err.message);
    }

    // Comments table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          author VARCHAR(100),
          author_email VARCHAR(255),
          author_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
      `;
      tables.push('comments');
      console.log('✅ Created comments table');
    } catch (err) {
      console.error('❌ Error creating comments table:', err.message);
    }

    // Assessments table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS assessments (
          id SERIAL PRIMARY KEY,
          teacher_id INTEGER NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          type VARCHAR(50),
          subject VARCHAR(100),
          class_name VARCHAR(100),
          file_url TEXT,
          file_name VARCHAR(255),
          due_date DATE,
          total_marks INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
      `;
      tables.push('assessments');
      console.log('✅ Created assessments table');
    } catch (err) {
      console.error('❌ Error creating assessments table:', err.message);
    }

    // Teacher performance table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS teacher_performance (
          id SERIAL PRIMARY KEY,
          teacher_id INTEGER NOT NULL,
          activity_type VARCHAR(100),
          subject VARCHAR(100),
          class_name VARCHAR(100),
          description TEXT,
          rating INTEGER,
          date DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
      `;
      tables.push('teacher_performance');
      console.log('✅ Created teacher_performance table');
    } catch (err) {
      console.error('❌ Error creating teacher_performance table:', err.message);
    }

    // Staff roles table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS staff_roles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          role_type VARCHAR(50) NOT NULL,
          department VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `;
      tables.push('staff_roles');
      console.log('✅ Created staff_roles table');
    } catch (err) {
      console.error('❌ Error creating staff_roles table:', err.message);
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📋 Tables created:', tables.join(', '));

    res.json({
      success: true,
      message: 'Database initialized successfully!',
      tables: tables,
      count: tables.length
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database initialization failed: ' + error.message
    });
  }
});

// ==================== COMMENTS ====================
// Get comments for a specific post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await sql`SELECT * FROM comments WHERE post_id = ${postId} ORDER BY created_at ASC`;
    res.json(comments);
  } catch (err) {
    console.error('Comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all comments (for admin)
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await sql`SELECT * FROM comments ORDER BY created_at DESC`;
    res.json(comments);
  } catch (err) {
    console.error('Comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a post
app.post('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, author, authorEmail, authorId } = req.body;

    const result = await sql`
      INSERT INTO comments (post_id, text, author, author_email, author_id, created_at)
      VALUES (${postId}, ${text}, ${author}, ${authorEmail || null}, ${authorId || null}, NOW())
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a comment
app.put('/api/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const result = await sql`
      UPDATE comments
      SET text = ${text}, updated_at = NOW()
      WHERE id = ${commentId}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment
app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    await sql`DELETE FROM comments WHERE id = ${commentId}`;
    res.status(204).end();
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoints for backward compatibility
app.put('/api/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    const result = await sql`
      UPDATE comments
      SET text = ${text}, updated_at = NOW()
      WHERE id = ${commentId} AND post_id = ${postId}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    await sql`DELETE FROM comments WHERE id = ${commentId} AND post_id = ${postId}`;
    res.status(204).end();
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== CHAT ====================
const { getChatMessages, sendChatMessage, deleteChatMessage } = require('./simple-chat');

app.get('/api/chat', getChatMessages);
app.post('/api/chat', sendChatMessage);
app.delete('/api/chat', deleteChatMessage);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
