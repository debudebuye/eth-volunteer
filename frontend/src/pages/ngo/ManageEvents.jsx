import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, API_BASE_URL } from "../../config/api.config";
import Toast from "../../components/Toast";
import useAuthStore from "../../store/authStore";

const ManageEvents = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [events, setEvents] = useState([]);
    const [editEventId, setEditEventId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!isAuthenticated) {
                setToast({ message: "Please log in to manage events", type: "error" });
                setIsLoading(false);
                return;
            }
    
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/events/events`, {
                    method: "GET",
                    credentials: "include",
                });
    
                const data = await response.json();
                console.log("API Response:", data);
                
                // Handle response structure
                const responseData = data.data || data;
                const eventsList = responseData.events || responseData;
                
                if (response.ok && Array.isArray(eventsList)) {
                    setEvents(eventsList);
                } else {
                    setToast({ message: data.message || "Failed to fetch events", type: "error" });
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                setToast({ message: "An error occurred. Please try again.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchEvents();
    }, [isAuthenticated]);
    const handleEditClick = (event) => {
        setEditEventId(event._id);
        setEditFormData({
            name: event.name,
            description: event.description,
            date: event.date.split("T")[0],
            location: event.location,
            image: null,
        });
        // Set existing image as preview
        if (event.image) {
            const imagePath = event.image;
            const filename = imagePath.includes('\\') || imagePath.includes('/') 
                ? imagePath.split(/[/\\]/).pop() 
                : imagePath;
            setImagePreview(`${API_BASE_URL}/uploads/${filename}`);
        } else {
            setImagePreview(null);
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setToast({ message: "Image size should be less than 5MB", type: "error" });
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                setToast({ message: "Please select a valid image file", type: "error" });
                return;
            }
            
            setEditFormData({ ...editFormData, image: file });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setEditFormData({ ...editFormData, image: null });
        setImagePreview(null);
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", editFormData.name);
            formData.append("description", editFormData.description);
            formData.append("date", editFormData.date);
            formData.append("location", editFormData.location);
            
            if (editFormData.image) {
                formData.append("image", editFormData.image);
            }

            const response = await fetch(`${API_URL}/events/update/${editEventId}`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setToast({ message: "Event updated successfully! 🎉", type: "success" });
                setEditEventId(null);
                setImagePreview(null);
                
                // Refresh events to get updated data
                const refreshResponse = await fetch(`${API_URL}/events/events`, {
                    method: "GET",
                    credentials: "include",
                });
                const refreshData = await refreshResponse.json();
                const responseData = refreshData.data || refreshData;
                const eventsList = responseData.events || responseData;
                if (Array.isArray(eventsList)) {
                    setEvents(eventsList);
                }
            } else {
                setToast({ message: data.message || "Failed to update event", type: "error" });
            }
        } catch (error) {
            console.error("Error updating event:", error);
            setToast({ message: "An error occurred. Please try again.", type: "error" });
        }
    };

    const handleDeleteClick = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/events/delete/${eventId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();
            if (response.ok) {
                setToast({ message: "Event deleted successfully!", type: "success" });
                setEvents((prevEvents) =>
                    prevEvents.filter((event) => event._id !== eventId)
                );
            } else {
                setToast({ message: data.message || "Failed to delete event", type: "error" });
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            setToast({ message: "An error occurred. Please try again.", type: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium group"
                >
                    <svg 
                        className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <span>🎯</span>
                        Manage Your Events
                    </h1>
                    <p className="text-gray-600 mt-2">Edit or delete your created events</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading your events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h3>
                        <p className="text-gray-600">You haven't created any events yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {events.map((event) => (
                            <div key={event._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                {editEventId === event._id ? (
                                    // Edit Form
                                    <form onSubmit={handleEditFormSubmit} className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                <span>✏️</span>
                                                Edit Event
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Event Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Event Name"
                                                    value={editFormData.name}
                                                    onChange={handleEditFormChange}
                                                    required
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Description *
                                                </label>
                                                <textarea
                                                    name="description"
                                                    placeholder="Event Description"
                                                    value={editFormData.description}
                                                    onChange={handleEditFormChange}
                                                    required
                                                    rows="3"
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                                                ></textarea>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Date *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        value={editFormData.date}
                                                        onChange={handleEditFormChange}
                                                        required
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Location *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        placeholder="Location"
                                                        value={editFormData.location}
                                                        onChange={handleEditFormChange}
                                                        required
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Upload */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Event Image
                                                </label>
                                                {!imagePreview ? (
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="hidden"
                                                            id="edit-image-upload"
                                                        />
                                                        <label
                                                            htmlFor="edit-image-upload"
                                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                                                        >
                                                            <div className="text-center">
                                                                <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                <p className="mt-1 text-sm text-gray-600">Click to upload new image</p>
                                                                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-48 object-cover rounded-lg shadow-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg"
                                                >
                                                    💾 Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditEventId(null)}
                                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    // Event Display
                                    <div>
                                        {/* Event Image */}
                                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                                            {event.image ? (
                                                <>
                                                    <img
                                                        src={(() => {
                                                            // Extract just the filename from the full path
                                                            const imagePath = event.image;
                                                            const filename = imagePath.includes('\\') || imagePath.includes('/') 
                                                                ? imagePath.split(/[/\\]/).pop() 
                                                                : imagePath;
                                                            return `${API_BASE_URL}/uploads/${filename}`;
                                                        })()}
                                                        alt={event.name}
                                                        crossOrigin="anonymous"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            console.error('Image failed to load:', e.target.src);
                                                            e.target.style.display = 'none';
                                                            e.target.nextElementSibling.nextElementSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                    {/* Fallback placeholder */}
                                                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                                                        <div className="text-center">
                                                            <div className="text-6xl mb-2">🖼️</div>
                                                            <p className="text-gray-600 font-medium">Image not available</p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-6xl mb-2">📅</div>
                                                        <p className="text-gray-600 font-medium">No image</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                            <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                                            <div className="flex gap-4 mt-2 text-white text-sm">
                                                <span className="flex items-center gap-1">
                                                    📅 {new Date(event.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    📍 {event.location}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <p className="text-gray-600 mb-6 line-clamp-3">{event.description}</p>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEditClick(event)}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <span>✏️</span>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(event._id)}
                                                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <span>🗑️</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageEvents;