import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get all comments for a post
      const comments = await sql`
        SELECT 
          c.id,
          c.content,
          c.author,
          c.author_email,
          c.created_at as "createdAt",
          c.updated_at as "updatedAt",
          u.name as "authorName",
          u.avatar as "authorAvatar"
        FROM comments c
        LEFT JOIN users u ON c.author_email = u.email
        WHERE c.post_id = ${postId}
        ORDER BY c.created_at ASC
      `;

      res.status(200).json(comments);
    } else if (req.method === 'POST') {
      // Create a new comment
      const { content, author, authorEmail } = req.body;

      if (!content || !author) {
        return res.status(400).json({ error: 'Content and author are required' });
      }

      const result = await sql`
        INSERT INTO comments (post_id, content, author, author_email)
        VALUES (${postId}, ${content}, ${author}, ${authorEmail || null})
        RETURNING 
          id,
          content,
          author,
          author_email as "authorEmail",
          created_at as "createdAt"
      `;

      res.status(201).json(result[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Comments API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
