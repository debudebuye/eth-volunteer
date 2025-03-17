import { useNavigate, useParams } from "react-router-dom";

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  // Fetch event details based on eventId (replace with actual API call)
  const event = {
    id: eventId,
    title: "Event 1",
    date: "2023-10-15",
    description: "This is a sample event.",
  };

  const handleSave = () => {
    // Implement save logic here (e.g., call an API to update the event)
    console.log(`Saving event with ID: ${eventId}`);
    alert(`Event with ID: ${eventId} updated`);
    navigate("/ngo/manage-events");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Edit Event</h1>
        <button
          onClick={() => navigate("/ngo/manage-events")}
          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Back to Manage Events
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Event: {event.title}</h2>
        <div className="w-full max-w-4xl bg-white p-6 shadow-lg rounded-lg">
          <form>
            <div className="mb-4">
              <label className="block text-gray-700">Event Title</label>
              <input
                type="text"
                defaultValue={event.title}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Event Date</label>
              <input
                type="date"
                defaultValue={event.date}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Event Description</label>
              <textarea
                defaultValue={event.description}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;