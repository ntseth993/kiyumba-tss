import { createPool } from '@neondatabase/serverless';

const pool = createPool(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER,
        title TEXT,
        type TEXT,
        instructions TEXT,
        questions JSONB,
        visible BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    if (req.method === 'GET') {
      const { course_id } = req.query;
      let q = 'SELECT * FROM assessments';
      let params = [];
      if (course_id) {
        q += ' WHERE course_id = $1';
        params = [course_id];
      }
      q += ' ORDER BY created_at DESC';
      const result = await pool.query(q, params);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { course_id, title, type, instructions, questions, visible } = req.body;
      if (!title || typeof title !== 'string' || title.length < 3) {
        return res.status(400).json({ error: 'Title required (min 3 chars)' });
      }
      if (!type || !['quiz','exam','test'].includes(type)) {
        return res.status(400).json({ error: 'Type must be quiz, exam, or test' });
      }
      if (!course_id || isNaN(Number(course_id))) {
        return res.status(400).json({ error: 'course_id required and must be integer' });
      }
      const q = `INSERT INTO assessments (course_id, title, type, instructions, questions, visible) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
      const result = await pool.query(q, [course_id, title, type, instructions, JSON.stringify(questions || []), visible || false]);
      return res.status(201).json(result.rows[0]);
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
