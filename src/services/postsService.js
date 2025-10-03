// Use API routes for all database operations
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Get all posts
export const getPosts = async () => {
  try {
    const response = await fetch(`${API_BASE}/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Get visible posts only
export const getVisiblePosts = async () => {
  try {
    const response = await fetch(`${API_BASE}/posts?visible=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch visible posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visible posts:', error);
    return [];
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (id, postData) => {
  try {
    const response = await fetch(`${API_BASE}/posts?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error('Failed to update post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/posts?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Toggle post visibility
export const togglePostVisibility = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/posts/toggle-visibility?id=${id}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle post visibility');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling visibility:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId, userId = 'anonymous') => {
  try {
    const response = await fetch(`${API_BASE}/posts/like?id=${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to like post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId, userId = 'anonymous') => {
  try {
    const response = await fetch(`${API_BASE}/posts/like?id=${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to unlike post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};
