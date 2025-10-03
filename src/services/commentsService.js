// Comments service for interacting with comments API
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Get comments for a specific post
export const getComments = async (postId) => {
  try {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Add a new comment
export const addComment = async (postId, commentData) => {
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
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
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
    throw error;
  }
};
