import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id } = req.query;
    const { userId = 'anonymous' } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (req.method === 'POST') {
      // Like the post
      const result = await sql`
        UPDATE posts
        SET 
          likes = likes + 1,
          liked_by = liked_by || ${JSON.stringify([userId])}::jsonb
        WHERE id = ${id}
        AND NOT (liked_by @> ${JSON.stringify([userId])}::jsonb)
        RETURNING 
          id,
          title,
          likes,
          liked_by as "likedBy"
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Post not found or already liked' });
      }

      res.status(200).json(result[0]);
    } else if (req.method === 'DELETE') {
      // Unlike the post
      const result = await sql`
        UPDATE posts
        SET 
          likes = GREATEST(likes - 1, 0),
          liked_by = liked_by - ${userId}
        WHERE id = ${id}
        AND liked_by @> ${JSON.stringify([userId])}::jsonb
        RETURNING 
          id,
          title,
          likes,
          liked_by as "likedBy"
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Post not found or not liked' });
      }

      res.status(200).json(result[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Like/Unlike error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
