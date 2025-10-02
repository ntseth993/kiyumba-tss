import { sql } from '../lib/db';

// Fallback to localStorage if database is not available
const useLocalStorage = !sql;

// Get all posts
export const getPosts = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('posts') || '[]');
  }

  try {
    const posts = await sql`
      SELECT 
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
      FROM posts
      ORDER BY created_at DESC
    `;
    
    return posts.map(post => ({
      ...post,
      comments: [] // We'll add comments later if needed
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Get visible posts only
export const getVisiblePosts = async () => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    return posts.filter(p => p.visible !== false);
  }

  try {
    const posts = await sql`
      SELECT 
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
      FROM posts
      WHERE visible = true
      ORDER BY created_at DESC
    `;
    
    return posts.map(post => ({
      ...post,
      comments: []
    }));
  } catch (error) {
    console.error('Error fetching visible posts:', error);
    return [];
  }
};

// Create a new post
export const createPost = async (postData) => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const newPost = {
      id: Date.now(),
      ...postData,
      date: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    const updated = [newPost, ...posts];
    localStorage.setItem('posts', JSON.stringify(updated));
    return newPost;
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
        ${postData.title},
        ${postData.content},
        ${postData.type || 'text'},
        ${postData.imageUrl || null},
        ${postData.videoUrl || null},
        ${postData.textSize || 'medium'},
        ${postData.visible !== false},
        ${postData.author || 'Admin'}
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
    
    return {
      ...result[0],
      comments: []
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (id, postData) => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => 
      p.id === id ? { ...p, ...postData } : p
    );
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === id);
  }

  try {
    const result = await sql`
      UPDATE posts
      SET 
        title = ${postData.title},
        content = ${postData.content},
        type = ${postData.type},
        image_url = ${postData.imageUrl || null},
        video_url = ${postData.videoUrl || null},
        text_size = ${postData.textSize || 'medium'},
        visible = ${postData.visible !== false},
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
    
    return {
      ...result[0],
      comments: []
    };
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (id) => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(updated));
    return true;
  }

  try {
    await sql`DELETE FROM posts WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Toggle post visibility
export const togglePostVisibility = async (id) => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => 
      p.id === id ? { ...p, visible: !p.visible } : p
    );
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === id);
  }

  try {
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
    
    return {
      ...result[0],
      comments: []
    };
  } catch (error) {
    console.error('Error toggling visibility:', error);
    throw error;
  }
};
