import { useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment, FaUserPlus, FaUserMinus, FaUsers } from "react-icons/fa";

const EventCard = ({ event, user, likes, joinedEvents, handleLike, handleJoin }) => {
  const navigate = useNavigate();

  // Navigate to the event details page
  const handleEventClick = () => {
    navigate(`/event/${event._id}`);
  };

  // Log the image URL for debugging
  console.log("Image URL:", `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}${event.image.replace("..", "")}`);

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      {/* Clickable Event Image */}
      <img
        src={`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}${event.image.replace("..", "")}`}
        alt={event.name}
        className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
        onClick={handleEventClick} // Navigate to event details on click
      />

      {/* Clickable Event Title */}
      <h3
        className="text-lg font-bold cursor-pointer hover:text-blue-500"
        onClick={handleEventClick} // Navigate to event details on click
      >
        {event.name}
      </h3>

      <p className="text-gray-600 mt-2">{event.organization}</p>

      {/* Display the number of participants */}
      <div className="flex items-center text-gray-600 mt-2">
        <FaUsers className="mr-2" />
        <span>{event.participants?.length || 0} Participants</span>
      </div>

      {/* Like, Comment, Join Icons */}
      <div className="flex justify-between mt-4">
        {/* Like Button */}
        <button
          onClick={() => handleLike(event._id)}
          className="flex items-center"
        >
          <FaThumbsUp
            className={`mr-2 ${event.likedBy?.includes(user?._id) ? "text-red-600" : "text-red-300"}`} // Red for like, light red for unlike
          />
          <span>({likes[event._id] || 0})</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={handleEventClick} // Navigate to event details on click
          className="flex items-center text-green-500 hover:text-green-700"
        >
          <FaComment className="mr-2" /> ({event.comments?.length || 0})
        </button>

        {/* Join/Unjoin Button */}
        <button
          onClick={() => handleJoin(event._id)}
          className="flex items-center"
        >
          {joinedEvents.includes(event._id) ? (
            <FaUserMinus className="text-red-600 mr-2" /> // Red with minus icon for unjoin
          ) : (
            <FaUserPlus className="text-green-600 mr-2" /> // Green with plus icon for join
          )}
        </button>
      </div>
    </div>
  );
};

export default EventCard;