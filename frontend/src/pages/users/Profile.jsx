import { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve the user object from localStorage
        const userFromStorage = JSON.parse(localStorage.getItem("user"));

        // Check if the user object and email exist
        if (!userFromStorage || !userFromStorage.email) {
          console.error("User email not found in localStorage");
          return;
        }

        const email = userFromStorage.email; // Get the email from localStorage
        console.log("Fetching profile for email:", email); // Debugging

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/profile/${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authorization
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Set the fetched user data
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authorization
          },
          body: JSON.stringify(user),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Update localStorage
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
        placeholder="Email"
        disabled // Email is often not editable
      />
      <input
        type="text"
        name="location"
        value={user.location}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
        placeholder="Location"
      />
      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save
      </button>
    </div>
  );
};

export default Profile;