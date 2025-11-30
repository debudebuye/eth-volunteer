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
    <nav className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section - Welcome Message */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1 animate-fade-in">
              Welcome, {user?.name || "Volunteer"}! 👋
            </h2>
            <p className="text-green-100 text-sm animate-fade-in-delay">
              Find and join events that match your interests
            </p>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-4">
            {/* Enhanced Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-64 px-4 py-2 pl-10 rounded-lg text-gray-700 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Profile Icon with Hover Effect */}
            <div
              className="cursor-pointer transform transition-transform duration-200 hover:scale-110"
              onClick={() => navigate("/user/editprofile")}
              title="Edit Profile"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-white hover:text-green-100 transition-colors" />
              )}
            </div>

            {/* Enhanced Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg font-medium shadow-md hover:bg-red-600 hover:shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;