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
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("foryou");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [likes, setLikes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
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

    // Clear search when switching tabs
    setSearchTerm("");
    
    if (activeTab === "foryou") {
      fetchEventsByLocation();
    } else if (activeTab === "joined") {
      fetchJoinedEvents();
    }
  }, [activeTab, user?._id]);

  useEffect(() => {
    // Filter events by search term and location
    let filtered = events;
    
    // Filter by search term (name, description, or location)
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by selected location
    if (selectedLocation !== "all") {
      filtered = filtered.filter((event) =>
        event.location?.toLowerCase() === selectedLocation.toLowerCase()
      );
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, selectedLocation, events]);

  // Get unique locations from events
  const getUniqueLocations = () => {
    const locations = events
      .map(event => event.location)
      .filter(location => location); // Remove null/undefined
    return [...new Set(locations)].sort();
  };

  const fetchEventsByLocation = async () => {
    try {
      // Fetch all approved events instead of by location
      const response = await fetch(
        `${API_URL}/events/approved`
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseData = await response.json();
      const data = responseData.data || responseData;
      const eventsList = data.events || data;
      const eventsArray = Array.isArray(eventsList) ? eventsList : [];
      
      setEvents(eventsArray);
      
      // Initialize likes count for all events
      const likesMap = {};
      eventsArray.forEach(event => {
        likesMap[event._id] = event.likesCount ?? event.likes ?? 0;
      });
      setLikes(likesMap);
      
      // Initialize joinedEvents from the fetched events
      if (user?._id) {
        const joined = eventsArray
          .filter(event => event.participants?.includes(user._id))
          .map(event => event._id);
        setJoinedEvents(joined);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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
      // Handle response structure: { success, data: { events: [...] } } or { data: [...] } or just [...]
      const data = responseData.data || responseData;
      const eventsList = data.events || (Array.isArray(data) ? data : []);
      
      console.log('Fetched joined events:', eventsList.length, 'events');
      
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
            ? { 
                ...event, 
                comments: [...(event.comments || []), data.comment],
                commentCount: (event.commentCount || 0) + 1
              }
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
          credentials: 'include',
          body: JSON.stringify({ userId: user?._id, eventId }),
        }
      );
  
      const data = await response.json();
      
      // Check if already joined (treat as success)
      const alreadyJoined = data.message?.toLowerCase().includes('already joined');
      
      // If already joined error, sync the state
      if (alreadyJoined) {
        if (!isJoined) {
          setJoinedEvents((prev) => [...prev, eventId]);
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId
                ? { 
                    ...event, 
                    participants: [...(event.participants || []), user._id],
                    participantCount: (event.participantCount || 0) + 1
                  }
                : event
            )
          );
        }
        if (activeTab === "joined") {
          fetchJoinedEvents();
        }
        return; // Exit early
      }
      
      // Check if the operation was successful
      if (response.ok || data.success) {
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
                    ? (event.participants || []).filter((id) => id !== user._id)
                    : [...(event.participants || []), user._id],
                  participantCount: isJoined
                    ? Math.max(0, (event.participantCount || 0) - 1)
                    : (event.participantCount || 0) + 1,
                }
              : event
          )
        );
  
        // Refresh joined events if on that tab
        if (activeTab === "joined") {
          fetchJoinedEvents();
        }
      } else {
        // If error, refresh the events to get the correct state from backend
        if (activeTab === "foryou") {
          fetchEventsByLocation();
        } else {
          fetchJoinedEvents();
        }
        throw new Error(data.message || "Failed to join/unjoin event");
      }
    } catch (error) {
      console.error("Error joining/unjoining event:", error);
      setError(error.message || "Failed to join/unjoin event. Please try again.");
    }
  };
  
  const handleLike = async (eventId) => {
    try {
      const userId = user?._id;
      if (!userId) {
        setError("Please log in to like events.");
        return;
      }

      const event = events.find((event) => event._id === eventId);
      
      // Convert likedBy array to strings for comparison
      const likedByStrings = (event?.likedBy || []).map(id => 
        typeof id === 'object' ? id.toString() : String(id)
      );
      const userIdString = String(userId);
      const hasLiked = likedByStrings.includes(userIdString);

      console.log('Like check:', {
        eventId,
        userId: userIdString,
        likedBy: likedByStrings,
        hasLiked
      });

      const endpoint = hasLiked ? "unlike" : "likes";
      
      // Optimistic update
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e._id === eventId
            ? {
                ...e,
                likes: hasLiked ? (e.likes || 1) - 1 : (e.likes || 0) + 1,
                likedBy: hasLiked
                  ? (e.likedBy || []).filter((id) => String(id) !== userIdString)
                  : [...(e.likedBy || []), userId],
              }
            : e
        )
      );

      setLikes((prevLikes) => ({
        ...prevLikes,
        [eventId]: hasLiked
          ? (prevLikes[eventId] || 1) - 1
          : (prevLikes[eventId] || 0) + 1,
      }));

      const response = await fetch(`${API_URL}/events/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ eventId, userId }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e._id === eventId
              ? {
                  ...e,
                  likes: hasLiked ? (e.likes || 0) + 1 : (e.likes || 1) - 1,
                  likedBy: hasLiked
                    ? [...(e.likedBy || []), userId]
                    : (e.likedBy || []).filter((id) => String(id) !== userIdString),
                }
              : e
          )
        );

        setLikes((prevLikes) => ({
          ...prevLikes,
          [eventId]: hasLiked
            ? (prevLikes[eventId] || 0) + 1
            : (prevLikes[eventId] || 1) - 1,
        }));

        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${hasLiked ? "unlike" : "like"} event`);
      }

      const data = await response.json();
      const eventData = data.data?.event || data.event || data;

      // Update with server response
      if (eventData) {
        const newLikeCount = eventData.likesCount ?? eventData.likes ?? 0;
        
        setLikes((prevLikes) => ({
          ...prevLikes,
          [eventId]: newLikeCount,
        }));

        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e._id === eventId
              ? {
                  ...e,
                  likes: newLikeCount,
                  likesCount: newLikeCount,
                  likedBy: eventData.likedBy || e.likedBy,
                }
              : e
          )
        );
      }
    } catch (error) {
      console.error("Error liking/unliking event:", error);
      setError(error.message || "Failed to like/unlike event. Please try again.");
      setTimeout(() => setError(null), 3000);
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
        {/* Location Filter - Only show on "For You" tab */}
        {activeTab === "foryou" && events.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-semibold">📍 Filter by Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                >
                  <option value="all">All Locations</option>
                  {getUniqueLocations().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {(searchTerm || selectedLocation !== "all") && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Showing {filteredEvents.length} of {events.length} events
                  </span>
                  {(searchTerm || selectedLocation !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedLocation("all");
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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