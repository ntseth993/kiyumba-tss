import { createPool } from '@neondatabase/serverless';

const pool = createPool(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { full_name, email, phone, program, level, education_level, status } = req.body;
      const q = `INSERT INTO applications (full_name, email, phone, program, level, education_level, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`;
      const result = await pool.query(q, [full_name, email, phone, program, level, education_level, status || 'pending']);
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const id = req.query.id || req.body.id;
      const { status } = req.body;
      const result = await pool.query('UPDATE applications SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body.id;
      await pool.query('DELETE FROM applications WHERE id=$1', [id]);
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
