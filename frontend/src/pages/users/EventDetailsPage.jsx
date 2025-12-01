import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, API_BASE_URL } from "../../config/api.config";
import useAuthStore from "../../store/authStore";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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

        const data = await response.json();
        setEvent(data);
        setComments(data.comments || []); // Initialize comments
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Handle submitting a new comment
  const handleCommentSubmit = async () => {
    try {
      const userId = user?._id;
      if (!userId) {
        alert("Please log in to comment");
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

      // Update the comments state with the new comment
      setComments((prevComments) => [...prevComments, data.comment]);
      setNewComment(""); // Clear the input field
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment.");
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
        <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
        {event.image && (
          <img
            src={`${API_BASE_URL}${event.image.startsWith('/') ? event.image : '/' + event.image}`}
            alt={event.name}
            className="w-full h-64 object-cover rounded-lg mb-4"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <p className="text-gray-600 mb-2">{event.description}</p>
        <p className="text-gray-600 mb-2">Location: {event.location}</p>
        <p className="text-gray-600 mb-2">Date: {new Date(event.date).toLocaleDateString()}</p>
        <p className="text-gray-600 mb-2">Organized by: {event.organization}</p>

        {/* Comment Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                  {/* Display the user's name before the comment */}
                  <p className="text-sm font-semibold text-blue-600">
                    {comment.userId?.name || "Anonymous"}
                  </p>
                  <p className="text-sm mt-1">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No comments yet.</p>
            )}
          </div>

          {/* Add Comment Section */}
          <div className="mt-6">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              rows="3"
            />
            <button
              onClick={handleCommentSubmit}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Submit Comment
            </button>
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
    </div>
  );
};

export default EventDetails;