import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const classes = await sql`SELECT * FROM classes ORDER BY name ASC`;
      return res.status(200).json(classes);
    }

    if (req.method === 'POST') {
      const { name, level, program } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Class name is required' });
      }
      const result = await sql`
        INSERT INTO classes (name, level, program)
        VALUES (${name}, ${level || null}, ${program || null})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Classes API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
