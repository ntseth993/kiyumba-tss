import { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../services/commentsService';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2, User } from 'lucide-react';

const Comments = ({ postId, comments: initialComments, onCommentAdded, inline = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const commentsData = await getComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const commentData = {
        text: newComment.trim(),
        author: user.name || user.email || 'Anonymous',
        authorEmail: user.email || '',
        authorId: user.id || 'anonymous'
      };

      const addedComment = await addComment(postId, commentData);
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`post-comments ${inline ? 'inline' : 'modal'}`}>
      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleAddComment} className={`comment-form ${inline ? 'inline' : 'modal'}`}>
          <div className={`comment-input-group ${inline ? 'inline' : 'modal'}`}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className={`comment-input ${inline ? 'inline' : 'modal'}`}
              maxLength={500}
              disabled={loading}
            />
            <button
              type="submit"
              className={`comment-submit-btn ${inline ? 'inline' : 'modal'}`}
              disabled={!newComment.trim() || loading}
            >
              {inline ? <Send size={14} /> : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className={`comments-list ${inline ? 'inline' : 'modal'}`}>
        {comments.length > 0 ? (
          comments.slice(0, inline ? 3 : comments.length).map(comment => (
            <div key={comment.id} className={`comment-item ${inline ? 'inline' : 'modal'}`}>
              <div className={`comment-header ${inline ? 'inline' : 'modal'}`}>
                <div className={`comment-author ${inline ? 'inline' : 'modal'}`}>
                  <User size={inline ? 14 : 16} />
                  <span className={`comment-author-name ${inline ? 'inline' : 'modal'}`}>
                    {comment.author}
                  </span>
                  <span className={`comment-date ${inline ? 'inline' : 'modal'}`}>
                    {inline ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) : new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {(user?.id === comment.authorId || user?.role === 'admin') && (
                  <button
                    className={`comment-delete-btn ${inline ? 'inline' : 'modal'}`}
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    <Trash2 size={inline ? 12 : 14} />
                  </button>
                )}
              </div>
              <div className={`comment-text ${inline ? 'inline' : 'modal'}`}>
                {comment.text}
              </div>
            </div>
          ))
        ) : (
          <div className={`no-comments ${inline ? 'inline' : 'modal'}`}>
            <p>{inline ? 'No comments' : 'No comments yet. Be the first to comment!'}</p>
          </div>
        )}
        {inline && comments.length > 3 && (
          <div className="view-more-comments">
            <button className="view-more-btn">View all {comments.length} comments</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
