// Use API routes for all database operations
const API_BASE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' ? 'INVALID_API_URL' : (import.meta.env.VITE_API_BASE || '/api');

// Fallback to localStorage only if explicitly enabled or API is not available
const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// Helper function to safely store in localStorage with cleanup
const safeLocalStorageSet = (key, data) => {
  try {
    // Clean up old posts if data is too large
    const dataString = JSON.stringify(data);
    if (dataString.length > 4000000) { // ~4MB limit
      console.warn('Posts data is large, cleaning up old posts...');
      // Keep only the 10 most recent posts
      const cleanedData = data.slice(0, 10);
      localStorage.setItem(key, JSON.stringify(cleanedData));
      return;
    }

    localStorage.setItem(key, dataString);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Cleaning up old posts...');
      // If still quota exceeded, clean up more aggressively
      const currentData = JSON.parse(localStorage.getItem(key) || '[]');
      const cleanedData = currentData.slice(0, 5); // Keep only 5 posts
      localStorage.setItem(key, JSON.stringify(cleanedData));
      throw new Error('Storage quota exceeded. Please clear browser data or use smaller files.');
    }
    throw error;
  }
};

// Helper function to safely get from localStorage
const safeLocalStorageGet = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Get all posts
export const getPosts = async () => {
  // Always try localStorage first, regardless of environment variable
  const localStoragePosts = safeLocalStorageGet('posts');
  if (localStoragePosts.length > 0) {
    console.log('Using localStorage for posts');
    return localStoragePosts.map(post => ({
      ...post,
      imageUrl: post.imageUrl || post.mediaUrl || '',
      videoUrl: post.videoUrl || '',
      excerpt: post.excerpt || post.content?.substring(0, 150) || '',
      visible: post.visible !== false
    }));
  }

  // Use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for posts (explicit mode)');
    const posts = safeLocalStorageGet('posts');
    return posts.map(post => ({
      ...post,
      imageUrl: post.imageUrl || post.mediaUrl || '',
      videoUrl: post.videoUrl || '',
      excerpt: post.excerpt || post.content?.substring(0, 150) || '',
      visible: post.visible !== false
    }));
  }

  try {
    const response = await fetch(`${API_BASE}/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Always fallback to localStorage
    const posts = safeLocalStorageGet('posts');
    return posts.map(post => ({
      ...post,
      imageUrl: post.imageUrl || post.mediaUrl || '',
      videoUrl: post.videoUrl || '',
      excerpt: post.excerpt || post.content?.substring(0, 150) || '',
      visible: post.visible !== false
    }));
  }
};

// Get visible posts only
export const getVisiblePosts = async () => {
  // Always try localStorage first, regardless of environment variable
  const localStoragePosts = JSON.parse(localStorage.getItem('posts') || '[]');
  if (localStoragePosts.length > 0) {
    console.log('Using localStorage for visible posts');
    return localStoragePosts
      .filter(p => p.visible !== false)
      .map(post => ({
        ...post,
        imageUrl: post.imageUrl || post.mediaUrl || '',
        videoUrl: post.videoUrl || '',
        excerpt: post.excerpt || post.content?.substring(0, 150) || '',
        visible: post.visible !== false
      }));
  }

  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for visible posts (explicit mode)');
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    return posts
      .filter(p => p.visible !== false)
      .map(post => ({
        ...post,
        imageUrl: post.imageUrl || post.mediaUrl || '',
        videoUrl: post.videoUrl || '',
        excerpt: post.excerpt || post.content?.substring(0, 150) || '',
        visible: post.visible !== false
      }));
  }

  try {
    const response = await fetch(`${API_BASE}/posts?visible=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch visible posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visible posts:', error);
    // Always fallback to localStorage
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    return posts
      .filter(p => p.visible !== false)
      .map(post => ({
        ...post,
        imageUrl: post.imageUrl || post.mediaUrl || '',
        videoUrl: post.videoUrl || '',
        excerpt: post.excerpt || post.content?.substring(0, 150) || '',
        visible: post.visible !== false
      }));
  }
};

// Upload media file (image or video)
export const uploadMedia = async (file) => {
  return new Promise((resolve, reject) => {
    // Check file size (max 100MB for videos, 10MB for images)
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error(`File size must be less than ${file.type.startsWith('video/') ? '100MB' : '10MB'}`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      const isVideo = file.type.startsWith('video/') || videoTypes.some(type => file.name.toLowerCase().includes(type.split('/')[1]));

      resolve({
        url: reader.result,
        type: isVideo ? 'video' : 'image',
        name: file.name,
        size: file.size,
        mimeType: file.type
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Create a new post
export const createPost = async (postData) => {
  if (useLocalStorage) {
    const posts = safeLocalStorageGet('posts');
    const newPost = {
      id: Date.now(),
      ...postData,
      date: new Date().toISOString(),
      likes: 0,
      comments: [],
      visible: postData.visible !== false
    };
    const updated = [newPost, ...posts];
    safeLocalStorageSet('posts', updated);
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
    // Fallback to localStorage if API fails, but with cleanup
    try {
      const posts = safeLocalStorageGet('posts');
      const newPost = {
        id: Date.now(),
        title: postData.title,
        content: postData.content || '',
        excerpt: postData.excerpt || postData.content?.substring(0, 150) || '',
        type: postData.type || 'blog',
        imageUrl: postData.imageUrl || '',
        videoUrl: postData.videoUrl || '',
        textSize: postData.textSize || 'medium',
        author: postData.author || 'Admin',
        date: new Date().toISOString(),
        likes: 0,
        comments: [],
        visible: postData.visible !== false,
        likedBy: [],
        images: []
      };
      const updated = [newPost, ...posts];
      safeLocalStorageSet('posts', updated);
      return newPost;
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to save post. Please try again or clear browser storage.');
    }
  }
};

// Update a post
export const updatePost = async (id, postData) => {
  if (useLocalStorage) {
    const posts = safeLocalStorageGet('posts');
    const updated = posts.map(p =>
      p.id === id ? {
        ...p,
        ...postData,
        excerpt: postData.excerpt || postData.content?.substring(0, 150) || p.excerpt,
        imageUrl: postData.imageUrl || p.imageUrl,
        videoUrl: postData.videoUrl || p.videoUrl,
        visible: postData.visible !== false
      } : p
    );
    safeLocalStorageSet('posts', updated);
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
    try {
      const posts = safeLocalStorageGet('posts');
      const updated = posts.map(p =>
        p.id === id ? {
          ...p,
          ...postData,
          excerpt: postData.excerpt || postData.content?.substring(0, 150) || p.excerpt,
          imageUrl: postData.imageUrl || p.imageUrl,
          videoUrl: postData.videoUrl || p.videoUrl,
          visible: postData.visible !== false
        } : p
      );
      safeLocalStorageSet('posts', updated);
      return updated.find(p => p.id === id);
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to update post. Please try again or clear browser storage.');
    }
  }
};

// Delete a post
export const deletePost = async (id) => {
  if (useLocalStorage) {
    const posts = safeLocalStorageGet('posts');
    const updated = posts.filter(p => p.id !== id);
    safeLocalStorageSet('posts', updated);
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
    try {
      const posts = safeLocalStorageGet('posts');
      const updated = posts.filter(p => p.id !== id);
      safeLocalStorageSet('posts', updated);
      return true;
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to delete post. Please try again or clear browser storage.');
    }
  }
};
export const togglePostVisibility = async (id) => {
  if (useLocalStorage) {
    const posts = safeLocalStorageGet('posts');
    const updated = posts.map(p =>
      p.id === id ? { ...p, visible: !p.visible } : p
    );
    safeLocalStorageSet('posts', updated);
    const updatedPost = updated.find(p => p.id === id);
    return {
      ...updatedPost,
      imageUrl: updatedPost.imageUrl || updatedPost.mediaUrl || '',
      videoUrl: updatedPost.videoUrl || '',
      excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150) || '',
      visible: updatedPost.visible !== false
    };
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
    try {
      const posts = safeLocalStorageGet('posts');
      const updated = posts.map(p =>
        p.id === id ? { ...p, visible: !p.visible } : p
      );
      safeLocalStorageSet('posts', updated);
      const updatedPost = updated.find(p => p.id === id);
      return {
        ...updatedPost,
        imageUrl: updatedPost.imageUrl || updatedPost.mediaUrl || '',
        videoUrl: updatedPost.videoUrl || '',
        excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150) || '',
        visible: updatedPost.visible !== false
      };
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to toggle visibility. Please try again or clear browser storage.');
    }
  }
};

// Track post view
export const viewPost = async (postId, userId = 'anonymous') => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for view tracking');
    const posts = safeLocalStorageGet('posts');
    const updated = posts.map(p => {
      if (p.id === postId) {
        const viewedBy = p.viewedBy || [];
        if (!viewedBy.includes(userId)) {
          return {
            ...p,
            views: (p.views || 0) + 1,
            viewedBy: [...viewedBy, userId]
          };
        }
      }
      return p;
    });
    safeLocalStorageSet('posts', updated);
    return updated.find(p => p.id === postId);
  }

  // If localStorage mode is not explicitly enabled, still try localStorage first if data exists
  const localStoragePosts = safeLocalStorageGet('posts');
  if (localStoragePosts.length > 0) {
    console.log('Using localStorage fallback for view tracking');
    const updated = localStoragePosts.map(p => {
      if (p.id === postId) {
        const viewedBy = p.viewedBy || [];
        if (!viewedBy.includes(userId)) {
          return {
            ...p,
            views: (p.views || 0) + 1,
            viewedBy: [...viewedBy, userId]
          };
        }
      }
      return p;
    });
    safeLocalStorageSet('posts', updated);
    return updated.find(p => p.id === postId);
  }

  try {
    const response = await fetch(`${API_BASE}/posts/view?id=${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to track view');
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking view:', error);
    // Fallback to localStorage if API fails
    try {
      const posts = safeLocalStorageGet('posts');
      const updated = posts.map(p => {
        if (p.id === postId) {
          const viewedBy = p.viewedBy || [];
          if (!viewedBy.includes(userId)) {
            return {
              ...p,
              views: (p.views || 0) + 1,
              viewedBy: [...viewedBy, userId]
            };
          }
        }
        return p;
      });
      safeLocalStorageSet('posts', updated);
      return updated.find(p => p.id === postId);
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to track view. Please try again or clear browser storage.');
    }
  }
};

// Like a post
export const likePost = async (postId, userId = 'anonymous') => {
  if (useLocalStorage) {
    const posts = safeLocalStorageGet('posts');
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
    safeLocalStorageSet('posts', updated);
    const updatedPost = updated.find(p => p.id === postId);
    return {
      ...updatedPost,
      imageUrl: updatedPost.imageUrl || updatedPost.mediaUrl || '',
      videoUrl: updatedPost.videoUrl || '',
      excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150) || '',
      visible: updatedPost.visible !== false
    };
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
    try {
      const posts = safeLocalStorageGet('posts');
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
      safeLocalStorageSet('posts', updated);
      const updatedPost = updated.find(p => p.id === postId);
      return {
        ...updatedPost,
        imageUrl: updatedPost.imageUrl || updatedPost.mediaUrl || '',
        videoUrl: updatedPost.videoUrl || '',
        excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150) || '',
        visible: updatedPost.visible !== false
      };
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to like post. Please try again or clear browser storage.');
    }
  }
};

// Unlike a post
export const unlikePost = async (postId, userId = 'anonymous') => {
  if (useLocalStorage) {
    const posts = safeLocalStorageGet('posts');
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
    safeLocalStorageSet('posts', updated);
    const updatedPost = updated.find(p => p.id === postId);
    return {
      ...updatedPost,
      imageUrl: updatedPost.imageUrl || updatedPost.mediaUrl || '',
      videoUrl: updatedPost.videoUrl || '',
      excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150) || '',
      visible: updatedPost.visible !== false
    };
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
    try {
      const posts = safeLocalStorageGet('posts');
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
      safeLocalStorageSet('posts', updated);
      const updatedPost = updated.find(p => p.id === postId);
      return {
        ...updatedPost,
        imageUrl: updatedPost.imageUrl || updatedPost.mediaUrl || '',
        videoUrl: updatedPost.videoUrl || '',
        excerpt: updatedPost.excerpt || updatedPost.content?.substring(0, 150) || '',
        visible: updatedPost.visible !== false
      };
    } catch (storageError) {
      console.error('localStorage fallback also failed:', storageError);
      throw new Error('Unable to unlike post. Please try again or clear browser storage.');
    }
  }
};
