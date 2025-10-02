import { createPool } from '@neondatabase/serverless';

const pool = createPool(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code TEXT,
        name TEXT,
        program TEXT,
        teacher TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM courses ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { code, name, program, teacher, description } = req.body;
      const q = `INSERT INTO courses (code, name, program, teacher, description) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
      const result = await pool.query(q, [code, name, program, teacher, description]);
      return res.status(201).json(result.rows[0]);
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
