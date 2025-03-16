import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EventDetails = () => {
  const { eventId } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/${eventId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

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
        <img
          src={`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}${event.image}`}
          alt={event.name}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <p className="text-gray-600 mb-2">{event.description}</p>
        <p className="text-gray-600 mb-2">Location: {event.location}</p>
        <p className="text-gray-600 mb-2">Date: {new Date(event.date).toLocaleDateString()}</p>
        <p className="text-gray-600 mb-2">Organized by: {event.organization}</p>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EventDetails;