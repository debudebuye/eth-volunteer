import { useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment, FaUserPlus, FaUserMinus, FaUsers } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api.config";

const EventCard = ({ event, user, likes, joinedEvents, handleLike, handleJoin }) => {
  const navigate = useNavigate();

  // Navigate to the event details page
  const handleEventClick = () => {
    navigate(`/event/${event._id}`);
  };

  // Construct proper image URL - extract filename from full path
  const imageUrl = event.image 
    ? (() => {
        const imagePath = event.image;
        // Extract just the filename from the full Windows/Unix path
        const filename = imagePath.includes('\\') || imagePath.includes('/') 
          ? imagePath.split(/[/\\]/).pop() 
          : imagePath;
        return `${API_BASE_URL}/uploads/${filename}`;
      })()
    : 'https://via.placeholder.com/400x200?text=No+Image';

  // Format date
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Convert likedBy to strings for proper comparison
  const likedByStrings = (event.likedBy || []).map(id => 
    typeof id === 'object' ? id.toString() : String(id)
  );
  const userIdString = String(user?._id || '');
  const isLiked = likedByStrings.includes(userIdString);
  const isJoined = joinedEvents.includes(event._id);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Event Image */}
      <div className="relative h-56 overflow-hidden group cursor-pointer" onClick={handleEventClick}>
        <img
          src={imageUrl}
          alt={event.name}
          crossOrigin="anonymous"
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
          }}
          onLoad={() => console.log('Image loaded successfully:', imageUrl)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        {/* Event Title */}
        <h3
          className="text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
          onClick={handleEventClick}
        >
          {event.name}
        </h3>

        {/* Event Description */}
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Meta Info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          {/* Date */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{eventDate}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="capitalize">{event.location}</span>
            </div>
          )}
        </div>

        {/* Participants Count */}
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <FaUsers className="text-green-600" />
          <span className="font-medium">{event.participantCount ?? event.participants?.length ?? 0} Participants</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {/* Like Button */}
          <button
            onClick={() => handleLike(event._id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isLiked
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaThumbsUp className={isLiked ? 'text-red-600' : 'text-gray-400'} />
            <span>{likes[event._id] ?? event.likes ?? 0}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleEventClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <FaComment className="text-gray-400" />
            <span>{event.commentCount ?? event.comments?.length ?? 0}</span>
          </button>

          {/* Join/Unjoin Button */}
          <button
            onClick={() => handleJoin(event._id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ml-auto ${
              isJoined
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {isJoined ? (
              <>
                <FaUserMinus />
                <span>Leave</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Join</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;