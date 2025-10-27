// Comments service for interacting with comments API
const getBaseURL = () => {
  // Check for localStorage mode first
  if (import.meta.env.VITE_USE_LOCAL_STORAGE === 'true') {
    return 'INVALID_API_URL';
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Use the same port as the main API service
  const port = import.meta.env.VITE_API_PORT || '4000';
  return `http://localhost:${port}`;
};

const API_BASE = getBaseURL();
const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' || API_BASE === 'INVALID_API_URL';

// Get comments for a specific post
export const getComments = async (postId) => {
  console.log('Getting comments for post:', postId, 'using localStorage:', useLocalStorage);

  // Always use localStorage as primary method
  if (useLocalStorage) {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    return comments.filter(c => c.postId === postId);
  }

  // Try localStorage first even if API is available
  const localStorageComments = JSON.parse(localStorage.getItem('comments') || '[]');
  if (localStorageComments.length > 0) {
    console.log('Using localStorage fallback for comments');
    return localStorageComments.filter(c => c.postId === postId);
  }

  // Only try API if no localStorage data exists and API is available
  if (API_BASE !== 'INVALID_API_URL') {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching comments from API:', error);
      // Fallback to empty array instead of localStorage to avoid loops
      return [];
    }
  }

  // Return empty array if no data source available
  return [];
};

// Add a new comment
export const addComment = async (postId, commentData) => {
  console.log('Adding comment for post:', postId, 'using localStorage:', useLocalStorage);

  // Always use localStorage as primary method
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

  // Try localStorage first even if API is available
  const localStorageComments = JSON.parse(localStorage.getItem('comments') || '[]');
  const newComment = {
    id: Date.now(),
    postId,
    ...commentData,
    createdAt: new Date().toISOString()
  };
  const updated = [newComment, ...localStorageComments];
  localStorage.setItem('comments', JSON.stringify(updated));
  console.log('Added comment to localStorage');
  return newComment;

  // Only try API if localStorage fails and API is available
  if (API_BASE !== 'INVALID_API_URL') {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
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
      console.error('Error adding comment to API:', error);
      // Still save to localStorage as backup
      const comments = JSON.parse(localStorage.getItem('comments') || '[]');
      const backupComment = {
        id: Date.now(),
        postId,
        ...commentData,
        createdAt: new Date().toISOString()
      };
      const backupUpdated = [backupComment, ...comments];
      localStorage.setItem('comments', JSON.stringify(backupUpdated));
      return backupComment;
    }
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  console.log('Deleting comment:', commentId, 'using localStorage:', useLocalStorage);

  // Always use localStorage as primary method
  if (useLocalStorage) {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const updated = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(updated));
    return true;
  }

  // Try localStorage first even if API is available
  const localStorageComments = JSON.parse(localStorage.getItem('comments') || '[]');
  const updated = localStorageComments.filter(c => c.id !== commentId);
  localStorage.setItem('comments', JSON.stringify(updated));
  console.log('Deleted comment from localStorage');
  return true;

  // Only try API if localStorage fails and API is available
  if (API_BASE !== 'INVALID_API_URL') {
    try {
      const response = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      return true;
    } catch (error) {
      console.error('Error deleting comment from API:', error);
      // Still delete from localStorage as backup
      const comments = JSON.parse(localStorage.getItem('comments') || '[]');
      const backupUpdated = comments.filter(c => c.id !== commentId);
      localStorage.setItem('comments', JSON.stringify(backupUpdated));
      return true;
    }
  }
};
