import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const events = await sql`SELECT * FROM events ORDER BY date ASC`;
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      const { title, description, date, time, location } = req.body;
      if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required' });
      }
      const result = await sql`
        INSERT INTO events (title, description, date, time, location)
        VALUES (${title}, ${description || null}, ${date}, ${time || null}, ${location || null})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, description, date, time, location } = req.body;
      const result = await sql`
        UPDATE events
        SET title = ${title}, description = ${description}, date = ${date}, 
            time = ${time}, location = ${location}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(result[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM events WHERE id = ${id}`;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Events API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
