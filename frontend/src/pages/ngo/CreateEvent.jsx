import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api.config";
import useAuthStore from "../../store/authStore";
import Toast from "../../components/Toast";

const CreateEvent = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
        creatorEmail: user?.email || "",
        creatorName: user?.organization || user?.name || "",
        image: null,
    });
    
    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setToast({ message: "Image size should be less than 5MB", type: "error" });
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setToast({ message: "Please select a valid image file", type: "error" });
                return;
            }
            
            setFormData({ ...formData, image: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setFormData({ ...formData, image: null });
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const eventData = new FormData();
        eventData.append("name", formData.name);
        eventData.append("description", formData.description);
        eventData.append("date", formData.date);
        eventData.append("location", formData.location);
        eventData.append("creatorEmail", formData.creatorEmail); // Append creatorEmail
        eventData.append("creatorName", formData.creatorName);   // Append creatorName
        eventData.append("approved", false); // Default to false
        if (formData.image) {
            eventData.append("image", formData.image);
        }

        // Log FormData for debugging
        for (let [key, value] of eventData.entries()) {
            console.log(key, value);
        }

        if (!isAuthenticated || !user) {
            setToast({ message: "Please log in to create an event", type: "error" });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch(`${API_URL}/events/create`, {
                method: "POST",
                body: eventData,
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                setToast({ message: "Event created successfully! Pending admin approval 🎉", type: "success" });
                setFormData({
                    name: "",
                    description: "",
                    date: "",
                    location: "",
                    creatorEmail: user?.email || "",
                    creatorName: user?.organization || user?.name || "",
                    image: null,
                });
                setImagePreview(null);
            } else {
                console.error("Event creation failed:", data);
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
                    setToast({ message: `Validation failed: ${errorMessages}`, type: "error" });
                } else {
                    setToast({ message: data.message || "Event creation failed!", type: "error" });
                }
            }
        } catch (error) {
            console.error("Error creating event:", error);
            setToast({ message: "An error occurred. Please try again.", type: "error" });
        } finally {
            setIsSubmitting(false);
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
            
            <div className="max-w-4xl mx-auto">
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

                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <span>📅</span>
                            Create New Event
                        </h2>
                        <p className="text-blue-100 mt-2">Fill in the details to create your event</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Event Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Event Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter event name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>

                        {/* Event Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Event Description *
                            </label>
                            <textarea
                                name="description"
                                placeholder="Describe your event..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Date and Location Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
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
                                    placeholder="Event location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Creator Info Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Creator Email *
                                </label>
                                <input
                                    type="email"
                                    name="creatorEmail"
                                    placeholder="your@email.com"
                                    value={formData.creatorEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Creator Name *
                                </label>
                                <input
                                    type="text"
                                    name="creatorName"
                                    placeholder="Organization/Name"
                                    value={formData.creatorName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Image Upload with Preview */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Event Image
                            </label>
                            
                            {!imagePreview ? (
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        <div className="text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-600">
                                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Event...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <span>✨</span>
                                        Create Event
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;