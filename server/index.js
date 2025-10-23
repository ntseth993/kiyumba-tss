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

// Import posts API route
const postsRoutes = require('../api/posts.cjs');
const usersRoutes = require('../api/users/index.cjs');

// Mount API routes
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

// ==================== CHAT ====================
const { getChatMessages, sendChatMessage, deleteChatMessage } = require('./simple-chat');

app.get('/api/chat', getChatMessages);
app.post('/api/chat', sendChatMessage);
app.delete('/api/chat', deleteChatMessage);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
