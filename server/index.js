const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM applications ORDER BY applied_date DESC');
    // Normalize rows so frontend (which expects first_name, last_name, applied_date)
    // works whether the DB has separate first/last columns or a single full_name.
    const normalized = result.rows.map(r => {
      // determine applied_date field
      const applied_date = r.applied_date || r.created_at || r.appliedAt || null;

      // determine first and last name
      let first_name = r.first_name;
      let last_name = r.last_name;
      if (!first_name && r.full_name) {
        const parts = String(r.full_name).trim().split(/\s+/);
        first_name = parts.shift() || '';
        last_name = parts.join(' ') || '';
      }

      return {
        ...r,
        first_name: first_name || '',
        last_name: last_name || '',
        applied_date
      };
    });

    res.json(normalized);
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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
