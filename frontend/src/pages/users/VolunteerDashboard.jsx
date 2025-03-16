import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment, FaUserPlus, FaUserCircle, FaUserCheck } from "react-icons/fa";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("foryou");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")); // Get user info
  const profileImage = user?.profileImage || null; // Assuming profile image exists

  useEffect(() => {
    if (activeTab === "foryou") {
      fetchEventsByLocation();
    } else if (activeTab === "following") {
      fetchEventsForFollowing();
    }
  }, [activeTab]);

  const fetchEventsByLocation = async () => {
    try {
      const location = user?.location || "defaultLocation";
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/by-location?location=${location}`
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Fetched events:", data); // Debugging
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events by location:", error);
      setEvents([]);
    }
  };

  const fetchEventsForFollowing = async () => {
    try {
      setIsLoading(true); // Start loading
      const userId = user?._id;
      if (!userId) {
        throw new Error("User ID is missing.");
      }

      // Use the correct endpoint and parameter
      const url = `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/following?userId=${userId}`;
      console.log("Request URL:", url); // Debugging

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        console.error("Backend error response:", errorData); // Debugging
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array.");
      }

      setEvents(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching events for following:", error);
      setError("Failed to fetch events. Please try again later.");
      setEvents([]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleFollow = async (eventId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ eventId, userId: user?._id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Follow response:", data); // Debugging
      alert("Followed successfully!");

      // Refresh the events list if the "Following" tab is active
      if (activeTab === "following") {
        fetchEventsForFollowing();
      }
    } catch (error) {
      console.error("Error following event:", error);
      alert("Failed to follow event.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
        <h2 className="block text-2xl font-bold mb-4">Welcome, {user?.name || "Volunteer"}</h2>
        <p className="text-gray-100 mb-6">Find and join events that match your interests.</p>
        <div className="flex items-center space-x-4">
          {/* Profile Icon */}
          <div className="cursor-pointer" onClick={() => navigate("/user/editprofile")}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-10 h-10" />
            )}
          </div>
          {/* Logout Button */}
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700">
            Logout
          </button>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md">
        <div className="flex justify-center space-x-4 p-4">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`px-4 py-2 rounded-lg ${activeTab === "foryou" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-4 py-2 rounded-lg ${activeTab === "following" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        {/* Event List */}
        <div className="w-full space-y-6">
          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="bg-white p-6 shadow-lg rounded-lg">
                <img
                  src={`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}${event.image}`}
                  alt={event.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
                  onClick={() => navigate(`/event/${event._id}`)}
                />
                <h3 className="text-lg font-bold">{event.name}</h3>
                <p className="text-gray-600 mt-2">{event.organization}</p>

                {/* Like, Comment, Join, and Follow Icons */}
                <div className="flex justify-between mt-4">
                  <button className="flex items-center text-blue-500 hover:text-blue-700">
                    <FaThumbsUp className="mr-2" /> Like
                  </button>
                  <button className="flex items-center text-green-500 hover:text-green-700">
                    <FaComment className="mr-2" /> Comment
                  </button>
                  <button className="flex items-center text-purple-500 hover:text-purple-700">
                    <FaUserPlus className="mr-2" /> Join
                  </button>
                  <button
                    onClick={() => handleFollow(event._id)}
                    className="flex items-center text-orange-500 hover:text-orange-700"
                  >
                    <FaUserCheck className="mr-2" /> Follow
                  </button>
                </div>
              </div>
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