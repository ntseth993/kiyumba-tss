const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function handler(req, res) {
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
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;

async function handleGet(req, res) {
  const { visible } = req.query;
  
  let query;
  if (visible === 'true') {
    query = sql`
      SELECT 
        id,
        title,
        content,
        type,
        image_url as "imageUrl",
        images,
        video_url as "videoUrl",
        text_size as "textSize",
        visible,
        author,
        likes,
        liked_by as "likedBy",
        created_at as "date"
      FROM posts
      WHERE visible = true
      ORDER BY created_at DESC
    `;
  } else {
    query = sql`
      SELECT 
        id,
        title,
        content,
        type,
        image_url as "imageUrl",
        images,
        video_url as "videoUrl",
        text_size as "textSize",
        visible,
        author,
        likes,
        liked_by as "likedBy",
        created_at as "date"
      FROM posts
      ORDER BY created_at DESC
    `;
  }

  const posts = await query;
  
  const formattedPosts = posts.map(post => ({
    ...post,
    images: post.images || [],
    likedBy: post.likedBy || [],
    comments: []
  }));

  res.status(200).json(formattedPosts);
}

async function handlePost(req, res) {
  const { title, content, type, imageUrl, videoUrl, textSize, visible, author } = req.body;

  // Validate required fields
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Check video URL size (data URLs can be very large)
  if (videoUrl && videoUrl.length > 50000000) { // ~50MB limit for data URLs
    return res.status(400).json({
      error: 'Video file is too large. Please use a smaller video file (under 50MB) or consider uploading to an external service.'
    });
  }

  try {
    const result = await sql`
      INSERT INTO posts (
        title,
        content,
        type,
        image_url,
        video_url,
        text_size,
        visible,
        author
      )
      VALUES (
        ${title},
        ${content},
        ${type || 'text'},
        ${imageUrl || null},
        ${videoUrl || null},
        ${textSize || 'medium'},
        ${visible !== false},
        ${author || 'Admin'}
      )
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

    const newPost = {
      ...result[0],
      images: [],
      likedBy: [],
      comments: []
    };

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: 'Failed to create post. Please try again.',
      details: error.message
    });
  }
}

async function handlePut(req, res) {
  const { id } = req.query;
  const { title, content, type, imageUrl, videoUrl, textSize, visible } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Post ID is required' });
  }

  // Check video URL size for updates too
  if (videoUrl && videoUrl.length > 50000000) { // ~50MB limit for data URLs
    return res.status(400).json({
      error: 'Video file is too large. Please use a smaller video file (under 50MB) or consider uploading to an external service.'
    });
  }

  try {
    const result = await sql`
      UPDATE posts
      SET
        title = ${title},
        content = ${content},
        type = ${type},
        image_url = ${imageUrl || null},
        video_url = ${videoUrl || null},
        text_size = ${textSize || 'medium'},
        visible = ${visible !== false},
        updated_at = CURRENT_TIMESTAMP
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
    console.error('Error updating post:', error);
    res.status(500).json({
      error: 'Failed to update post. Please try again.',
      details: error.message
    });
  }
}

async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Post ID is required' });
  }

  await sql`DELETE FROM posts WHERE id = ${id}`;
  
  res.status(200).json({ success: true });
}
