import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment, FaUserPlus } from "react-icons/fa"; // Icons for like, comment, and join

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState("");

  useEffect(() => {
    // Fetch approved events
    const fetchApprovedEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events/approved");
        const data = await response.json();
        console.log("Fetched events:", data); // Log the events data
        setEvents(data);
      } catch (error) {
        console.error("Error fetching approved events:", error);
      }
    };
    fetchApprovedEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEventClick = (eventId) => {
    // Navigate to the event details page
    navigate(`/event/${eventId}`);
  };

  const handleLike = (eventId) => {
    // Handle like action for the specific event
    setLikes(likes + 1);
    console.log("Liked event:", eventId);
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  const handleCommentSubmit = (eventId) => {
    // Handle comment submission for the specific event
    console.log("Comment submitted for event:", eventId, comments);
    setComments("");
  };

  const handleJoin = (eventId) => {
    // Handle join action for the specific event
    console.log("Joined event:", eventId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-green-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Volunteer Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700">
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, Volunteer</h2>
        <p className="text-gray-700 mb-6">Find and join events that match your interests.</p>

        {/* Event List - Displaying One Card Per Row */}
        <div className="w-full space-y-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-6 shadow-lg rounded-lg">
              <img
                src={encodeURI(event.image) || "https://via.placeholder.com/300"} // Encode the URL
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
                onClick={() => handleEventClick(event._id)} // Navigate to event details page
              />
              <h3 className="text-lg font-bold">{event.name}</h3>
              <p className="text-gray-600 mt-2">{event.organization}</p>

              {/* Like, Comment, and Join Icons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleLike(event._id)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FaThumbsUp className="mr-2" /> Like
                </button>
                <button
                  onClick={() => handleCommentSubmit(event._id)}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <FaComment className="mr-2" /> Comment
                </button>
                <button
                  onClick={() => handleJoin(event._id)}
                  className="flex items-center text-purple-500 hover:text-purple-700"
                >
                  <FaUserPlus className="mr-2" /> Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;