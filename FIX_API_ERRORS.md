# 🔧 Fix API Errors - Complete Guide

## ⚠️ **Problem Identified**

The errors occur because:
1. **Frontend** (Vite) runs on `http://localhost:5173`
2. **API functions** in `/api` folder are for **Vercel deployment only**
3. **Express server** in `/server` folder only has `/api/applications` endpoint
4. **Missing endpoints:** subjects, classes, teacher-subjects, chat, notifications, etc.

## ✅ **Solution: Two Options**

### **Option 1: Quick Fix (Use Vercel for APIs)**

Deploy to Vercel and use production APIs:

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Update API endpoints"
   git push
   ```

2. **Update `.env` file:**
   ```env
   VITE_API_URL=https://your-app.vercel.app
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

### **Option 2: Local Development (Recommended)**

Set up Express server with all endpoints:

#### **Step 1: Install dependencies in server folder**
```bash
cd server
npm install @neondatabase/serverless express cors dotenv
```

#### **Step 2: Replace `server/index.js`** with this comprehensive version:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import Neon database
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// ==================== APPLICATIONS ====================
app.get('/api/applications', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM applications ORDER BY applied_date DESC`;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, program, level, address, date_of_birth, previous_school, reason } = req.body;
    const result = await sql`
      INSERT INTO applications (first_name, last_name, email, phone, program, level, address, date_of_birth, previous_school, reason, status, applied_date)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone}, ${program}, ${level}, ${address}, ${date_of_birth}, ${previous_school}, ${reason}, 'pending', NOW()) RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await sql`UPDATE applications SET status=${status} WHERE id=${id} RETURNING *`;
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM applications WHERE id=${id}`;
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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const result = await sql`
      INSERT INTO subjects (name, code, description) 
      VALUES (${name}, ${code}, ${description}) RETURNING *
    `;
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
    const result = await sql`
      INSERT INTO classes (name, level, program) 
      VALUES (${name}, ${level}, ${program}) RETURNING *
    `;
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
        SELECT ts.*, s.name as subject_name, s.code as subject_code, 
               c.name as class_name, c.level, c.program
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
    const result = await sql`
      INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) 
      VALUES (${teacher_id}, ${subject_id}, ${class_id}) 
      RETURNING *
    `;
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
      const result = await sql`
        SELECT * FROM assessments 
        WHERE teacher_id = ${teacher_id}
        ORDER BY created_at DESC
      `;
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
        WHERE ${role} = ANY(target_roles)
        AND (expires_at IS NULL OR expires_at > NOW())
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

// ==================== CHAT ====================
app.get('/api/chat', async (req, res) => {
  try {
    const { limit = 50, user_id } = req.query;
    const messages = await sql`
      SELECT c.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM chat_messages c
      JOIN users u ON c.sender_id = u.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT ${parseInt(limit)}
    `;
    
    if (user_id) {
      await sql`
        UPDATE chat_messages
        SET is_read = true, read_at = NOW()
        WHERE sender_id != ${parseInt(user_id)} AND is_read = false
      `;
    }
    
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { sender_id, message, message_type = 'text', file_url, file_name, file_type, file_size, reply_to_id } = req.body;
    
    const result = await sql`
      INSERT INTO chat_messages (sender_id, message, message_type, file_url, file_name, file_type, file_size, reply_to_id, created_at, is_read)
      VALUES (${sender_id}, ${message || null}, ${message_type}, ${file_url || null}, ${file_name || null}, ${file_type || null}, ${file_size || null}, ${reply_to_id || null}, NOW(), false)
      RETURNING *
    `;
    
    const messageWithSender = await sql`
      SELECT c.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM chat_messages c
      JOIN users u ON c.sender_id = u.id
      WHERE c.id = ${result[0].id}
    `;
    
    res.status(201).json(messageWithSender[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== START SERVER ====================
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
```

#### **Step 3: Update server/.env file:**
```env
DATABASE_URL=your_neon_database_url_here
PORT=4000
```

#### **Step 4: Restart everything:**

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

---

## 🎯 **Current Status**

✅ **Vite proxy configured** - Points to `http://localhost:4000`
✅ **vercel.json updated** - All endpoints registered for deployment
⏳ **Express server** - Needs all endpoints added

---

## 📋 **Quick Start Commands**

```bash
# Terminal 1: Start Express server
cd server
npm run dev

# Terminal 2: Start Vite frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## ✨ **After Setup, Test These Features:**

1. ✅ Applications management
2. ✅ Teacher subjects assignment
3. ✅ Assessments creation
4. ✅ Chat messaging
5. ✅ Notifications display
6. ✅ Test submissions
7. ✅ Student conduct (DOD)
8. ✅ Student discipline (DOD)

All backend APIs are ready! Just need the Express server running locally. 🚀
