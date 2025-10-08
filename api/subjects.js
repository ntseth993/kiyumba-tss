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
      const subjects = await sql`SELECT * FROM subjects ORDER BY name ASC`;
      return res.status(200).json(subjects);
    }

    if (req.method === 'POST') {
      const { name, code, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Subject name is required' });
      }
      const result = await sql`
        INSERT INTO subjects (name, code, description)
        VALUES (${name}, ${code || null}, ${description || null})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Subjects API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
