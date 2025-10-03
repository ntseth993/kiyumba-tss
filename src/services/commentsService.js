// Comments service for interacting with comments API
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get comments for a specific post
export const getComments = async (postId) => {
  if (useLocalStorage) {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    return comments.filter(c => c.postId === postId);
  }

  try {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    return comments.filter(c => c.postId === postId);
  }
};

// Add a new comment
export const addComment = async (postId, commentData) => {
  if (useLocalStorage) {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const newComment = {
      id: Date.now(),
      postId,
      ...commentData,
      createdAt: new Date().toISOString()
    };
    const updated = [newComment, ...comments];
    localStorage.setItem('comments', JSON.stringify(updated));
    return newComment;
  }

  try {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    // Fallback to localStorage if API fails
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const newComment = {
      id: Date.now(),
      postId,
      ...commentData,
      createdAt: new Date().toISOString()
    };
    const updated = [newComment, ...comments];
    localStorage.setItem('comments', JSON.stringify(updated));
    return newComment;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  if (useLocalStorage) {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const updated = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(updated));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    // Fallback to localStorage if API fails
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const updated = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(updated));
    return true;
  }
};
