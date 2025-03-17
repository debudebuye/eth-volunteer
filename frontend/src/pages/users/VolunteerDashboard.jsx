import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TabNavigation from "./TabNavigation";
import EventCard from "./EventCard";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // For search results
  const [activeTab, setActiveTab] = useState("foryou");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [likes, setLikes] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [comments, setComments] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const profileImage = user?.profileImage || null;

  useEffect(() => {
    if (activeTab === "foryou") {
      fetchEventsByLocation();
    } else if (activeTab === "joined") {
      fetchJoinedEvents();
    }
  }, [activeTab]);

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
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/by-location?location=${location}`
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events by location:", error);
      setEvents([]);
    }
  };

  const fetchJoinedEvents = async () => {
    try {
      setIsLoading(true);
      const userId = user?._id;
      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const url = `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/joined-events?userId=${userId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      setJoinedEvents(data.map((event) => event._id));
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
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleCommentSubmit = async (eventId, commentText) => {
    try {
      const userId = user?._id;
      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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