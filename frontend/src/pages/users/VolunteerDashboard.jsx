import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TabNavigation from "./TabNavigation";
import EventCard from "./EventCard";
import { API_URL } from "../../config/api.config";
import useAuthStore from "../../store/authStore";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // For search results
  const [activeTab, setActiveTab] = useState("foryou");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [likes, setLikes] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [comments, setComments] = useState({});

  const profileImage = user?.profileImage || null;

  // Redirect to login if no user found
  useEffect(() => {
    if (!isAuthenticated || !user || !user._id) {
      console.error("No valid user session found. Redirecting to login...");
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Only fetch if user is loaded
    if (!user || !user._id) {
      console.error("User not found in localStorage or missing _id");
      setError("User session not found. Please log in again.");
      return;
    }

    if (activeTab === "foryou") {
      fetchEventsByLocation();
    } else if (activeTab === "joined") {
      fetchJoinedEvents();
    }
  }, [activeTab, user?._id]);

  useEffect(() => {
    // Filter events whenever the search term or events change
    const filtered = events.filter((event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const fetchEventsByLocation = async () => {
    try {
      const location = user?.location || "defaultLocation";
      const response = await fetch(
        `${API_URL}/events/by-location?location=${location}&page=1&limit=50&status=approved`
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseData = await response.json();
      // Handle new pagination response structure: { success, data: { events, pagination } }
      const data = responseData.data || responseData;
      const eventsList = data.events || data;
      setEvents(Array.isArray(eventsList) ? eventsList : []);
    } catch (error) {
      console.error("Error fetching events by location:", error);
      setEvents([]);
    }
  };

  const fetchJoinedEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = user?._id;
      if (!userId) {
        console.error("User ID is missing. User object:", user);
        setError("User session expired. Please log in again.");
        setEvents([]);
        return;
      }

      const url = `${API_URL}/users/joined-events?userId=${userId}`;
      const response = await fetch(url, {
        credentials: 'include', // Send cookies with request
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle response structure: { success, data: [...] } or just [...]
      const data = responseData.data || responseData;
      const eventsList = Array.isArray(data) ? data : [];
      
      setEvents(eventsList);
      setJoinedEvents(eventsList.map((event) => event._id));
      setError(null);
    } catch (error) {
      console.error("Error fetching joined events:", error);
      setError("Failed to fetch joined events. Please try again later.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
    navigate("/login");
  };

  const handleCommentSubmit = async (eventId, commentText) => {
    try {
      const userId = user?._id;
      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const response = await fetch(
        `${API_URL}/events/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Send cookies with request
          body: JSON.stringify({ eventId, userId, text: commentText }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Update the events state to include the new comment
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? { ...event, comments: [...(event.comments || []), data.comment] }
            : event
        )
      );

      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment.");
    }
  };

  const handleJoin = async (eventId) => {
    try {
      const isJoined = joinedEvents.includes(eventId);
      const endpoint = isJoined ? "unjoin-event" : "join-event";
  
      const response = await fetch(
        `${API_URL}/users/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Send cookies with request
          body: JSON.stringify({ userId: user?._id, eventId }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Server response:", data); // Log the response for debugging
  
      // Update the joinedEvents state
      if (isJoined) {
        setJoinedEvents((prev) => prev.filter((id) => id !== eventId));
      } else {
        setJoinedEvents((prev) => [...prev, eventId]);
      }
  
      // Update the events state to reflect the new participants array
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? {
                ...event,
                participants: isJoined
                  ? event.participants.filter((id) => id !== user._id) // Remove user from participants
                  : [...event.participants, user._id], // Add user to participants
              }
            : event
        )
      );
  
      alert(isJoined ? "Unjoined successfully!" : "Joined successfully!");
  
      if (activeTab === "joined") {
        fetchJoinedEvents();
      }
    } catch (error) {
      console.error("Error joining/unjoining event:", error);
      alert("Failed to join/unjoin event.");
    }
  };
  
  const handleLike = async (eventId) => {
    try {
      const userId = user?._id;
      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const event = events.find((event) => event._id === eventId);
      const hasLiked = event?.likedBy?.includes(userId);

      const endpoint = hasLiked ? "unlike" : "likes";
      const response = await fetch(
        `${API_URL}/events/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Send cookies with request
          body: JSON.stringify({ eventId, userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setLikes((prevLikes) => ({
        ...prevLikes,
        [eventId]: data.event.likes,
      }));

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? { ...event, likes: data.event.likes, likedBy: data.event.likedBy }
            : event
        )
      );

      alert(data.message || (hasLiked ? "Unliked successfully!" : "Liked successfully!"));
    } catch (error) {
      console.error("Error liking/unliking event:", error);
      alert("Failed to like/unlike event.");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term); // Update the search term
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        user={user}
        profileImage={profileImage}
        handleLogout={handleLogout}
        handleSearch={handleSearch} // Pass the search handler
      />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                user={user}
                likes={likes}
                joinedEvents={joinedEvents}
                handleLike={handleLike}
                handleJoin={handleJoin}
                handleCommentSubmit={handleCommentSubmit} // Pass the comment handler
              />
            ))
          ) : (
            <p className="text-gray-700 items-center">No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;