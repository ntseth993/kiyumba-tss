import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get user profile
      const user = await sql`
        SELECT 
          id,
          name,
          email,
          role,
          avatar,
          created_at as "createdAt"
        FROM users
        WHERE id = ${userId}
      `;

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user[0]);
    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, avatar } = req.body;

      const result = await sql`
        UPDATE users
        SET 
          name = ${name || null},
          avatar = ${avatar || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING 
          id,
          name,
          email,
          role,
          avatar,
          updated_at as "updatedAt"
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(result[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
