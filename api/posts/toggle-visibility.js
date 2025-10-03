import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const result = await sql`
      UPDATE posts
      SET visible = NOT visible
      WHERE id = ${id}
      RETURNING 
        id,
        title,
        content,
        type,
        image_url as "imageUrl",
        video_url as "videoUrl",
        text_size as "textSize",
        visible,
        author,
        likes,
        created_at as "date"
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = {
      ...result[0],
      images: [],
      likedBy: [],
      comments: []
    };

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
