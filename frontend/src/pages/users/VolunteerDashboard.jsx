import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TabNavigation from "./TabNavigation";
import EventCard from "./EventCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
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

    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("Failed to submit comment. Please try again.");
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
  
      if (activeTab === "joined") {
        fetchJoinedEvents();
      }
    } catch (error) {
      console.error("Error joining/unjoining event:", error);
      setError("Failed to join/unjoin event. Please try again.");
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
      
      // Handle response structure: { success, data: { event } } or { event }
      const eventData = data.data?.event || data.event || data;
      
      if (eventData && eventData.likes !== undefined) {
        setLikes((prevLikes) => ({
          ...prevLikes,
          [eventId]: eventData.likes,
        }));

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId
              ? { 
                  ...event, 
                  likes: eventData.likes, 
                  likedBy: eventData.likedBy || event.likedBy 
                }
              : event
          )
        );
      }
    } catch (error) {
      console.error("Error liking/unliking event:", error);
      setError("Failed to like/unlike event. Please try again.");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term); // Update the search term
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Navbar */}
      <Navbar
        user={user}
        profileImage={profileImage}
        handleLogout={handleLogout}
        handleSearch={handleSearch}
      />
      
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredEvents.length > 0 ? (
            <div className="grid gap-6 animate-fade-in">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event._id}
                  className="transform transition-all duration-300 hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard
                    event={event}
                    user={user}
                    likes={likes}
                    joinedEvents={joinedEvents}
                    handleLike={handleLike}
                    handleJoin={handleJoin}
                    handleCommentSubmit={handleCommentSubmit}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={activeTab === "foryou" ? "No Events Available" : "No Joined Events"}
              message={
                activeTab === "foryou"
                  ? "There are no events in your area right now. Check back later for new opportunities!"
                  : "You haven't joined any events yet. Browse the 'For You' tab to find events to join!"
              }
              icon={activeTab === "foryou" ? "🔍" : "📅"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;