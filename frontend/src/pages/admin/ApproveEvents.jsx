import { useState, useEffect } from "react";

const ApproveEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null); // State to store selected event for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch pending events");

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching pending events:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (id, status) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/${status}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to ${status} event`);

      // Optimistically update state without refetching
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));

      // Send email notification if the event is approved
      if (status === "approve") {
        const emailResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/send-email/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.message || "Failed to send email notification");
        }
      }
    } catch (error) {
      console.error(`Error ${status}ing event:`, error);
      setError(error.message); // Display the error to the user
    }
  };

  // Function to open modal and set the selected event
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true); // Open modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Approve/Reject NGO Event Posts</h2>

      {loading && <p className="text-blue-500 mb-4">Loading events...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600">Event Name</th>
              <th className="px-4 py-3 border-b text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-4 text-center text-gray-500">No pending events</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{event.name}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-2">
                      {/* View Button */}
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
                        onClick={() => handleViewEvent(event)} // Pass event to handleViewEvent
                      >
                        View
                      </button>
                      {/* Approve Button */}
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
                        onClick={() => updateEventStatus(event._id, "approve")}
                      >
                        Approve
                      </button>
                      {/* Reject Button */}
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all"
                        onClick={() => updateEventStatus(event._id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Event Details */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-2xl font-bold mb-4">{selectedEvent.name}</h3>
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveEvents;
