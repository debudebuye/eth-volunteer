import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, API_BASE_URL } from "../../config/api.config";
import useAuthStore from "../../store/authStore";
import Toast from "../../components/Toast";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch event details and comments
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(
          `${API_URL}/events/${eventId}?populate=comments.userId`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Event API Response:', responseData);
        
        // Handle response structure: { success, data: { event } } or { event } or just event
        const data = responseData.data || responseData;
        const eventData = data.event || data;
        console.log('Event Data:', eventData);
        
        setEvent(eventData);
        setComments(eventData.comments || []); // Initialize comments
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Format time ago
  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const commentDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(commentDate.getTime())) return 'Just now';
    
    const seconds = Math.floor((now - commentDate) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    return commentDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Handle submitting a new comment
  const handleCommentSubmit = async () => {
    try {
      const userId = user?._id;
      if (!userId) {
        setToast({ message: "Please log in to comment", type: "warning" });
        return;
      }

      const response = await fetch(
        `${API_URL}/events/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ eventId, userId, text: newComment }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Create a properly structured comment with user info
      const newCommentData = {
        ...data.comment,
        userId: {
          _id: user._id,
          name: user.name
        },
        createdAt: new Date().toISOString()
      };

      // Update the comments state with the new comment
      setComments((prevComments) => [...prevComments, newCommentData]);
      setNewComment(""); // Clear the input field
      setToast({ message: "Comment added successfully!", type: "success" });
    } catch (error) {
      console.error("Error submitting comment:", error);
      setToast({ message: error.message || "Failed to submit comment", type: "error" });
    }
  };

  // Handle edit comment
  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  // Handle save edited comment
  const handleSaveEdit = async (commentId) => {
    try {
      const userId = user?._id;
      if (!userId) {
        setToast({ message: "Please log in to edit comments", type: "warning" });
        return;
      }

      if (!editText.trim()) {
        setToast({ message: "Comment cannot be empty", type: "warning" });
        return;
      }

      const response = await fetch(
        `${API_URL}/events/${eventId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ userId, text: editText }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update comment");
      }

      // Update local state
      setComments(prevComments =>
        prevComments.map(c =>
          c._id === commentId ? { ...c, text: editText } : c
        )
      );
      setEditingCommentId(null);
      setEditText("");
      setToast({ message: "Comment updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error editing comment:", error);
      setToast({ message: error.message || "Failed to edit comment", type: "error" });
    }
  };

  // Handle delete comment - show confirmation
  const handleDeleteComment = (commentId) => {
    setDeleteConfirm(commentId);
  };

  // Confirm delete comment
  const confirmDeleteComment = async () => {
    const commentId = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const userId = user?._id;
      if (!userId) {
        setToast({ message: "Please log in to delete comments", type: "warning" });
        return;
      }

      const response = await fetch(
        `${API_URL}/events/${eventId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }

      // Update local state
      setComments(prevComments => prevComments.filter(c => c._id !== commentId));
      setToast({ message: "Comment deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      setToast({ message: error.message || "Failed to delete comment", type: "error" });
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    try {
      const comment = comments.find(c => c._id === commentId);
      const hasLiked = comment?.likedBy?.includes(user?._id);
      const endpoint = hasLiked ? 'unlike' : 'like';

      const response = await fetch(
        `${API_URL}/events/${eventId}/comments/${commentId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ userId: user?._id }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to like/unlike comment');
      }

      // Update local state
      setComments(prevComments =>
        prevComments.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              likes: hasLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
              likedBy: hasLiked
                ? c.likedBy.filter(id => id !== user?._id)
                : [...(c.likedBy || []), user?._id]
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Handle reply to comment
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ userId: user?._id, text: replyText }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      const responseData = await response.json();
      console.log('Reply response:', responseData);

      // Create properly structured reply
      // Backend returns { success, message, data: { reply } } or { reply }
      const replyData = responseData.data?.reply || responseData.reply;
      
      const newReply = {
        _id: Date.now().toString(), // Temporary ID
        userId: {
          _id: user._id,
          name: user.name
        },
        text: replyText,
        createdAt: replyData?.createdAt || new Date().toISOString()
      };

      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        })
      );

      setReplyingToId(null);
      setReplyText("");
    } catch (error) {
      console.error("Error adding reply:", error);
      setToast({ message: error.message || "Failed to add reply", type: "error" });
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message
  }

  if (!event) {
    return <div>Event not found.</div>; // Handle case where event is not found
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-2xl">
        {/* Event Image */}
        {event.image && (
          <div className="relative h-80 overflow-hidden rounded-xl mb-6">
            <img
              src={(() => {
                const imagePath = event.image;
                const filename = imagePath.includes('\\') || imagePath.includes('/') 
                  ? imagePath.split(/[/\\]/).pop() 
                  : imagePath;
                return `${API_BASE_URL}/uploads/${filename}`;
              })()}
              alt={event.name}
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.src = 'https://via.placeholder.com/800x400?text=Event+Image';
              }}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </div>
        )}

        {/* Event Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          {event.description && (
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          )}
          
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {event.creatorName && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Organized by <span className="font-medium">{event.creatorName}</span></span>
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments ({comments.length})
          </h2>

          {/* Add Comment Section - At Top Like Social Media */}
          <div className="mb-6">
            <div className="flex gap-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              {/* Comment Input - Social Media Style */}
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-3xl focus:outline-none focus:bg-white focus:border-green-500 focus:shadow-lg resize-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                    rows={newComment ? "3" : "1"}
                    maxLength={500}
                    style={{ minHeight: '52px' }}
                  />
                  
                  {/* Character Count */}
                  {newComment && (
                    <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                      {newComment.length}/500
                    </div>
                  )}
                </div>

                {/* Action Buttons - Show when typing */}
                {newComment && (
                  <div className="flex items-center justify-between mt-3 px-2">
                    <div className="flex gap-2">
                      {/* Emoji/Actions placeholder */}
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Add emoji"
                      >
                        😊
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Add image"
                      >
                        📷
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewComment("")}
                        className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                // Handle both populated and non-populated userId
                const commenterName = typeof comment.userId === 'object' 
                  ? comment.userId?.name 
                  : 'Anonymous';
                const commenterInitial = commenterName?.charAt(0).toUpperCase() || 'A';
                
                const isOwner = typeof comment.userId === 'object' 
                  ? comment.userId?._id === user?._id 
                  : comment.userId === user?._id;
                const isEditing = editingCommentId === comment._id;
                
                return (
                  <div key={comment._id || index} className="flex gap-3 group">
                    {/* Commenter Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {commenterInitial}
                      </div>
                    </div>
                    
                    {/* Comment Content */}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-2xl px-4 py-3 group-hover:bg-gray-100 transition-colors relative">
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            {commenterName}
                          </p>
                          
                          {/* Edit/Delete buttons for comment owner */}
                          {isOwner && !isEditing && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <div className="mt-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                              rows="2"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveEdit(comment._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditText("");
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {comment.text}
                          </p>
                        )}
                      </div>
                      
                      {/* Comment Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-4 mt-1 px-4">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                              comment.likedBy?.includes(user?._id)
                                ? 'text-red-600'
                                : 'text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <svg className="w-3 h-3" fill={comment.likedBy?.includes(user?._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {comment.likes > 0 && <span>{comment.likes}</span>}
                            <span>Like</span>
                          </button>
                          <button
                            onClick={() => setReplyingToId(comment._id)}
                            className="text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors"
                          >
                            Reply
                          </button>
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingToId === comment._id && (
                        <div className="mt-3 px-4">
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${commenterName}...`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                                rows="2"
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleReplySubmit(comment._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingToId(null);
                                    setReplyText("");
                                  }}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
                          {comment.replies.map((reply, replyIndex) => {
                            const replyerName = typeof reply.userId === 'object' 
                              ? reply.userId?.name 
                              : 'Anonymous';
                            const replyerInitial = replyerName?.charAt(0).toUpperCase() || 'R';
                            
                            return (
                              <div key={reply._id || replyIndex} className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {replyerInitial}
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                                    <p className="font-semibold text-gray-900 text-xs mb-1">
                                      {replyerName}
                                    </p>
                                    <p className="text-gray-800 text-xs leading-relaxed">
                                      {reply.text}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-400 ml-3 mt-1 inline-block">
                                    {getTimeAgo(reply.createdAt)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 font-medium">No comments yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Comment</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;