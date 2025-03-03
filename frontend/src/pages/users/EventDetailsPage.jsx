import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment, FaUserPlus } from "react-icons/fa";

const EventDetailsPage = () => {
    const { eventId } = useParams(); // Get the event ID from the URL
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState("");

    useEffect(() => {
        // Fetch event details by ID
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/${eventId}`);
                const data = await response.json();
                setEvent(data);
                setLikes(data.likes); // Initialize likes from the event data
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };
        fetchEventDetails();
    }, [eventId]);

    const handleLike = () => {
        setLikes(likes + 1);
    };

    const handleCommentChange = (e) => {
        setComments(e.target.value);
    };

    const handleCommentSubmit = () => {
        console.log("Comment submitted:", comments);
        setComments("");
    };

    const handleJoin = () => {
        console.log("Joined event:", eventId);
    };

    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-6">
            <button
                onClick={() => navigate(-1)} // Go back to the previous page
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
            >
                Back
            </button>

            <div className="bg-white p-6 shadow-lg rounded-lg">
                <img
                    src={event.image} // Use the image URL from the backend
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-2xl font-bold">{event.name}</h3>
                <p className="text-gray-600 mt-2">{event.organization}</p>
                <p className="text-gray-700 mt-4">{event.description}</p>

                {/* Like, Comment, and Join Section */}
                <div className="mt-4">
                    <button
                        onClick={handleLike}
                        className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                        <FaThumbsUp className="mr-2" /> Like ({likes})
                    </button>
                    <div className="mt-2">
                        <textarea
                            value={comments}
                            onChange={handleCommentChange}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Leave a comment"
                        />
                        <button
                            onClick={handleCommentSubmit}
                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                            Submit Comment
                        </button>
                    </div>
                    <button
                        onClick={handleJoin}
                        className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg"
                    >
                        <FaUserPlus className="mr-2" /> Join Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;