import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate


const Navbar = ({ user, profileImage, handleLogout, handleSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // Define navigate using useNavigate


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value); // Pass the search term to the parent component
  };

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      <div>
        <h2 className="block text-2xl font-bold mb-4">Welcome, {user?.name || "Volunteer"}</h2>
        <p className="text-gray-100 mb-6">Find and join events that match your interests.</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 rounded-lg text-gray-700 focus:outline-none"
        />
        {/* Profile Icon */}
        <div className="cursor-pointer" onClick={() => navigate("/user/editprofile")}>
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-10 h-10" />
          )}
        </div>
        {/* Logout Button */}
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;