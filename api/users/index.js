import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req, res) {
  // Get all users
  const users = await sql`
    SELECT 
      id,
      email,
      name,
      role,
      avatar,
      created_at as "createdAt"
    FROM users
    ORDER BY created_at DESC
  `;

  res.status(200).json(users);
}

async function handlePut(req, res) {
  const { userId, updates } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { name, email, role } = updates;

  const result = await sql`
    UPDATE users
    SET 
      name = ${name},
      email = ${email},
      role = ${role}
    WHERE id = ${userId}
    RETURNING id, email, name, role, avatar, created_at as "createdAt"
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(result[0]);
}

async function handleDelete(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  await sql`DELETE FROM users WHERE id = ${userId}`;
  
  res.status(200).json({ success: true });
}
