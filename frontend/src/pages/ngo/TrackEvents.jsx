import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api.config";
import Toast from "../../components/Toast";
import useAuthStore from "../../store/authStore";

const TrackEvents = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAuthenticated || !user) {
        setToast({ message: "Please log in to view events", type: "error" });
        setIsLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/events/track`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          setToast({ message: "Session expired. Please log in again.", type: "error" });
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const data = await response.json();
        console.log("API Response:", data);
        
        // Handle response structure: { success, data: { events } }
        const responseData = data.data || data;
        const eventsList = responseData.events || responseData;
        
        if (response.ok && Array.isArray(eventsList)) {
          setEvents(eventsList);
          if (eventsList.length === 0) {
            setToast({ message: "No events found. Create your first event!", type: "info" });
          }
        } else {
          setToast({ message: data.message || "Failed to fetch events", type: "error" });
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setToast({ message: "An error occurred. Please try again.", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated, user, navigate]);

  // Handle "View" button click
  const handleViewEvent = (event) => {
    console.log("Selected Event:", event); // Debugging: Log the selected event
    setSelectedEvent(event);
  };

  // Handle closing the event details modal
  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const handleReplySubmit = async (eventId, commentId) => {
    if (!replyText.trim()) {
      setToast({ message: "Please enter a reply", type: "warning" });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text: replyText }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setToast({ message: "Reply added successfully!", type: "success" });
        setReplyText("");
        setActiveCommentId(null);
        
        const eventData = data.data?.event || data.event || data;
        const updatedEvents = events.map((event) =>
          event._id === eventId ? eventData : event
        );
        setEvents(updatedEvents);
        setSelectedEvent(eventData);
      } else {
        setToast({ message: data.message || "Failed to add reply", type: "error" });
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      setToast({ message: "An error occurred. Please try again.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span>📊</span>
            Track Your Events
          </h1>
          <p className="text-gray-600 mt-2">Monitor likes, participants, and comments on your events</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">You haven't created any events yet.</p>
          </div>
        ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Event Name</th>
                  <th className="px-6 py-4 text-center font-semibold">📋 Status</th>
                  <th className="px-6 py-4 text-center font-semibold">❤️ Likes</th>
                  <th className="px-6 py-4 text-center font-semibold">👥 Participants</th>
                  <th className="px-6 py-4 text-center font-semibold">💬 Comments</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event, index) => (
                  <tr 
                    key={event._id} 
                    className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{event.name}</div>
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {event.status === 'approved' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ✓ Approved
                        </span>
                      ) : event.status === 'rejected' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          ✗ Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold">
                        {event.likedBy ? event.likedBy.length : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 font-bold">
                        {event.followers ? event.followers.length : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {event.comments ? event.comments.length : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white">{selectedEvent.name}</h2>
                  <div className="flex gap-4 mt-3 text-white text-sm">
                    <span className="flex items-center gap-1">
                      📅 {new Date(selectedEvent.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {selectedEvent.location}
                    </span>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>

                  {/* Likes Section */}
                  <div className="bg-red-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ❤️ Likes ({selectedEvent.likedBy ? selectedEvent.likedBy.length : 0})
                    </h3>
                    {selectedEvent.likedBy && selectedEvent.likedBy.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedEvent.likedBy.map((user, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No likes yet</p>
                    )}
                  </div>

                  {/* Participants Section */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      👥 Participants ({selectedEvent.followers ? selectedEvent.followers.length : 0})
                    </h3>
                    {selectedEvent.followers && selectedEvent.followers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedEvent.followers.map((participant, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="font-semibold text-gray-900">{participant.name}</p>
                            <p className="text-sm text-gray-500">{participant.email}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No participants yet</p>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      💬 Comments ({selectedEvent.comments ? selectedEvent.comments.length : 0})
                    </h3>
                    {selectedEvent.comments && selectedEvent.comments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedEvent.comments.map((comment, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-gray-800 mb-2">{comment.text}</p>
                            <p className="text-sm text-gray-500 mb-3">
                              By: <span className="font-semibold">{comment.userId.name}</span>
                            </p>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-6 mt-3 space-y-2 border-l-2 border-blue-200 pl-4">
                                <h4 className="text-sm font-bold text-gray-700">Replies:</h4>
                                {comment.replies.map((reply, replyIndex) => (
                                  <div key={replyIndex} className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-gray-700 text-sm">{reply.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      By: <span className="font-semibold">{reply.userId.name}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input */}
                            {activeCommentId === comment._id ? (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write your reply..."
                                  rows="3"
                                  className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReplySubmit(selectedEvent._id, comment._id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                                  >
                                    Submit Reply
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveCommentId(null);
                                      setReplyText("");
                                    }}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActiveCommentId(comment._id)}
                                className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                              >
                                <span>↩️</span> Reply
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No comments yet</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
                  <button
                    onClick={handleCloseDetails}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default TrackEvents;