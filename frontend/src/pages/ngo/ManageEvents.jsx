import { useState, useEffect } from "react";

const ManageEvents = () => {
    const [events, setEvents] = useState([]); // Initialize as an empty array
    const [editEventId, setEditEventId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
    });
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // Fetch events created by the logged-in NGO
    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("No token found. Please log in.");
                return;
            }
    
            setIsLoading(true);
            try {
                console.log("Fetching events..."); // Debugging: Indicate start of fetch
                console.log("Token:", token); // Debugging: Log the token
    
                const apiUrl = `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/events`;
                console.log("API URL:", apiUrl); // Debugging: Log the API URL
    
                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                console.log("Response Status:", response.status); // Debugging: Log the response status
                console.log("Response Headers:", response.headers); // Debugging: Log the response headers
    
                const data = await response.json();
                console.log("API Response Data:", data); // Debugging: Log the full API response
    
                if (response.ok && Array.isArray(data.events)) {
                    console.log("Events Fetched:", data.events); // Debugging: Log the fetched events
                    setEvents(data.events); // Set the fetched events
                } else {
                    console.error("Failed to fetch events. Response:", data); // Debugging: Log the error response
                    alert(data.message || "Failed to fetch events.");
                }
            } catch (error) {
                console.error("Error fetching events:", error); // Debugging: Log the error
                alert("An error occurred. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchEvents();
    }, []);
    // Handle edit button click 
    const handleEditClick = (event) => {
        setEditEventId(event._id);
        setEditFormData({
            name: event.name,
            description: event.description,
            date: event.date.split("T")[0], // Format date for input field
            location: event.location,
        });
    };

    // Handle form input changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    // Handle form submission for updating an event
    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/update/${editEventId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editFormData),
                }
            );

            const data = await response.json();
            if (response.ok) {
                alert("Event updated successfully!");
                setEditEventId(null);
                setEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event._id === editEventId ? { ...event, ...editFormData } : event
                    )
                );
            } else {
                alert(data.message || "Failed to update event.");
            }
        } catch (error) {
            console.error("Error updating event:", error);
            alert("An error occurred. Please try again.");
        }
    };

    // Handle delete button click
    const handleDeleteClick = async (eventId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/delete/${eventId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();
                if (response.ok) {
                    alert("Event deleted successfully!");
                    setEvents((prevEvents) =>
                        prevEvents.filter((event) => event._id !== eventId)
                    );
                } else {
                    alert(data.message || "Failed to delete event.");
                }
            } catch (error) {
                console.error("Error deleting event:", error);
                alert("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Manage Events</h2>
            {isLoading ? (
                <p className="text-center text-gray-500">Loading events...</p>
            ) : events.length === 0 ? (
                <p className="text-center text-gray-500">No events found.</p>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event._id} className="border p-4 rounded-lg shadow-sm">
                            {editEventId === event._id ? (
                                // Edit form
                                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Event Name"
                                        value={editFormData.name}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Event Description"
                                        value={editFormData.description}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    ></textarea>
                                    <input
                                        type="date"
                                        name="date"
                                        value={editFormData.date}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Event Location"
                                        value={editFormData.location}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            type="submit"
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditEventId(null)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // Event details
                                <div>
                                    <h3 className="text-xl font-semibold">{event.name}</h3>
                                    <p className="text-gray-600">{event.description}</p>
                                    <p className="text-gray-600">
                                        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Location:</strong> {event.location}
                                    </p>
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={() => handleEditClick(event)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(event._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageEvents;