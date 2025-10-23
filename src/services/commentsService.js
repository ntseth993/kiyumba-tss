// Comments service for interacting with comments API
const API_BASE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' ? 'INVALID_API_URL' : (import.meta.env.VITE_API_BASE || '/api');
const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// Get comments for a specific post
export const getComments = async (postId) => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for comments');
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    return comments.filter(c => c.postId === postId);
  }

  // Always try localStorage first, regardless of environment variable
  const localStorageComments = JSON.parse(localStorage.getItem('comments') || '[]');
  if (localStorageComments.length > 0) {
    console.log('Using localStorage fallback for comments');
    return localStorageComments.filter(c => c.postId === postId);
  }

  // Only try API if no localStorage data exists
  try {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Always fallback to localStorage
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    return comments.filter(c => c.postId === postId);
  }
};

// Add a new comment
export const addComment = async (postId, commentData) => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for adding comment');
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

  // Always try localStorage first, regardless of environment variable
  const localStorageComments = JSON.parse(localStorage.getItem('comments') || '[]');
  if (localStorageComments.length >= 0) {
    console.log('Using localStorage fallback for adding comment');
    const newComment = {
      id: Date.now(),
      postId,
      ...commentData,
      createdAt: new Date().toISOString()
    };
    const updated = [newComment, ...localStorageComments];
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
    // Always fallback to localStorage
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
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for deleting comment');
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const updated = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(updated));
    return true;
  }

  // Always try localStorage first, regardless of environment variable
  const localStorageComments = JSON.parse(localStorage.getItem('comments') || '[]');
  if (localStorageComments.length >= 0) {
    console.log('Using localStorage fallback for deleting comment');
    const updated = localStorageComments.filter(c => c.id !== commentId);
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
    // Always fallback to localStorage
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const updated = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(updated));
    return true;
  }
};
