import { useState } from "react";

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
        image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const eventData = new FormData();
        eventData.append("name", formData.name);
        eventData.append("description", formData.description);
        eventData.append("date", formData.date);
        eventData.append("location", formData.location);
        eventData.append("approved", false); // Default to false
        if (formData.image) {
          eventData.append("image", formData.image);
        }
      
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
      
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/events/create`, {
            method: "POST",
            body: eventData,
            headers: {
              Authorization: `Bearer ${token}`, // Add token to headers
            },
          });
      
          const data = await response.json();
          if (response.ok) {
            alert("Event created successfully! Pending admin approval.");
            setFormData({ name: "", description: "", date: "", location: "", image: null });
          } else {
            alert(data.message || "Event creation failed!");
          }
        } catch (error) {
          console.error("Error creating event:", error);
          alert("An error occurred. Please try again.");
        }
      };
      


    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Create Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Event Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                    name="description"
                    placeholder="Event Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                    type="text"
                    name="location"
                    placeholder="Event Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Create Event
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;
