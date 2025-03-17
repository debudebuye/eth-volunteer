import { useState, useEffect } from "react";

const TrackEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [replyText, setReplyText] = useState(""); // State for reply text
  const [activeCommentId, setActiveCommentId] = useState(null); // Track which comment is being replied to

  // Fetch events with comments, likes, and participants
  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/track`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("API Response:", data); // Debugging: Log the API response
        if (response.ok && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          alert(data.message || "Failed to fetch events.");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle "View" button click
  const handleViewEvent = (event) => {
    console.log("Selected Event:", event); // Debugging: Log the selected event
    setSelectedEvent(event);
  };

  // Handle closing the event details modal
  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  // Handle reply submission
  const handleReplySubmit = async (eventId, commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/${eventId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: replyText }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Reply added successfully!");
        setReplyText(""); // Clear the reply input
        setActiveCommentId(null); // Close the reply input
        // Refresh the events list
        const updatedEvents = events.map((event) =>
          event._id === eventId ? data.event : event
        );
        setEvents(updatedEvents);
        // Update the selected event in the modal
        setSelectedEvent(data.event);
      } else {
        alert(data.message || "Failed to add reply.");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Track Events</h1>
      {isLoading ? (
        <p className="text-center text-gray-500">Please wait, the events are loading...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div>
          {/* Events Table */}
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Event Name</th>
                <th className="p-3">Likes</th>
                <th className="p-3">Participants</th>
                <th className="p-3">Comments</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b">
                  <td className="p-3 text-center">{event.name}</td>
                  <td className="p-3 text-center">{event.likedBy ? event.likedBy.length : 0}</td>
                  <td className="p-3 text-center">{event.followers ? event.followers.length : 0}</td>
                  <td className="p-3 text-center">{event.comments ? event.comments.length : 0}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Event Details Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{selectedEvent.name}</h2>
                <p className="text-gray-600">{selectedEvent.description}</p>
                <p className="text-gray-600">
                  <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <strong>Location:</strong> {selectedEvent.location}
                </p>

                {/* Display Likes */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Likes</h3>
                  {selectedEvent.likedBy && selectedEvent.likedBy.length > 0 ? (
                    <ul>
                      {selectedEvent.likedBy.map((user, index) => (
                        <li key={index} className="text-gray-700">
                          {user.name} ({user.email})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No likes yet.</p>
                  )}
                </div>

                {/* Display Participants */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Participants</h3>
                  {selectedEvent.followers && selectedEvent.followers.length > 0 ? (
                    <ul>
                      {selectedEvent.followers.map((participant, index) => (
                        <li key={index} className="text-gray-700">
                          {participant.name} ({participant.email})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No participants yet.</p>
                  )}
                </div>

                {/* Display Comments and Replies */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Comments</h3>
                  {selectedEvent.comments && selectedEvent.comments.length > 0 ? (
                    selectedEvent.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg mt-2">
                        <p className="text-gray-700">{comment.text}</p>
                        <p className="text-sm text-gray-500">By: {comment.userId.name}</p>

                        {/* Display Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-4 mt-2">
                            <h4 className="text-md font-bold">Replies</h4>
                            {comment.replies.map((reply, replyIndex) => (
                              <div key={replyIndex} className="bg-gray-100 p-2 rounded-lg mt-2">
                                <p className="text-gray-700">{reply.text}</p>
                                <p className="text-sm text-gray-500">By: {reply.userId.name}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {activeCommentId === comment._id && (
                          <div className="mt-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => handleReplySubmit(selectedEvent._id, comment._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-700"
                            >
                              Submit Reply
                            </button>
                          </div>
                        )}

                        {/* Reply Button */}
                        <button
                          onClick={() => setActiveCommentId(comment._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-700"
                        >
                          Reply
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No comments yet.</p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseDetails}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackEvents;