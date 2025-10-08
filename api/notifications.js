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
      const { role } = req.query;
      
      if (role) {
        const notifications = await sql`
          SELECT * FROM notifications
          WHERE ${role} = ANY(target_roles)
          AND (expires_at IS NULL OR expires_at > NOW())
          ORDER BY created_at DESC
        `;
        return res.status(200).json(notifications);
      }
      
      const notifications = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
      return res.status(200).json(notifications);
    }

    if (req.method === 'POST') {
      const { title, message, type, target_roles, link, created_by, expires_at } = req.body;
      
      if (!title || !message || !type || !target_roles) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await sql`
        INSERT INTO notifications (title, message, type, target_roles, link, created_by, expires_at)
        VALUES (${title}, ${message}, ${type}, ${target_roles}, ${link || null}, ${created_by || null}, ${expires_at || null})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
