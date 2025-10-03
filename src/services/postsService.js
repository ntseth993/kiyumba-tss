// Use API routes for all database operations
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Fallback to localStorage if API is not available
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get all posts
export const getPosts = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('posts') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Fallback to localStorage if API fails
    return JSON.parse(localStorage.getItem('posts') || '[]');
  }
};

// Get visible posts only
export const getVisiblePosts = async () => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    return posts.filter(p => p.visible !== false);
  }

  try {
    const response = await fetch(`${API_BASE}/posts?visible=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch visible posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visible posts:', error);
    // Fallback to localStorage if API fails
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    return posts.filter(p => p.visible !== false);
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
    // Fallback to localStorage if API fails
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
    // Fallback to localStorage if API fails
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => 
      p.id === id ? { ...p, ...postData } : p
    );
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === id);
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
    const response = await fetch(`${API_BASE}/posts?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    // Fallback to localStorage if API fails
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(updated));
    return true;
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
    const response = await fetch(`${API_BASE}/posts/toggle-visibility?id=${id}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle post visibility');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling visibility:', error);
    // Fallback to localStorage if API fails
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => 
      p.id === id ? { ...p, visible: !p.visible } : p
    );
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === id);
  }
};

// Like a post
export const likePost = async (postId, userId = 'anonymous') => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        if (!likedBy.includes(userId)) {
          return {
            ...p,
            likes: (p.likes || 0) + 1,
            likedBy: [...likedBy, userId]
          };
        }
      }
      return p;
    });
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === postId);
  }

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
    // Fallback to localStorage if API fails
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        if (!likedBy.includes(userId)) {
          return {
            ...p,
            likes: (p.likes || 0) + 1,
            likedBy: [...likedBy, userId]
          };
        }
      }
      return p;
    });
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === postId);
  }
};

// Unlike a post
export const unlikePost = async (postId, userId = 'anonymous') => {
  if (useLocalStorage) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        if (likedBy.includes(userId)) {
          return {
            ...p,
            likes: Math.max((p.likes || 0) - 1, 0),
            likedBy: likedBy.filter(id => id !== userId)
          };
        }
      }
      return p;
    });
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === postId);
  }

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
    // Fallback to localStorage if API fails
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updated = posts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        if (likedBy.includes(userId)) {
          return {
            ...p,
            likes: Math.max((p.likes || 0) - 1, 0),
            likedBy: likedBy.filter(id => id !== userId)
          };
        }
      }
      return p;
    });
    localStorage.setItem('posts', JSON.stringify(updated));
    return updated.find(p => p.id === postId);
  }
};
