import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all contact form submissions for admin
    const submissions = await sql`
      SELECT 
        id,
        name,
        email,
        subject,
        message,
        created_at as "createdAt",
        is_read as "isRead"
      FROM contact_submissions
      ORDER BY created_at DESC
    `;

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Contact submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
