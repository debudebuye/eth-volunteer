import { useState } from "react";
import { FaUsers, FaRegClipboard, FaCheck, FaTimes, FaSignOutAlt } from "react-icons/fa"; // Importing icons for the navigation
import { useNavigate } from "react-router-dom";

import ManageNGO from "./ManageNGO";
import ManageVolunteer from "./ManageVolunteer";
import ApproveEvents from "./ApproveEvents";
import ApprovedEvents from "./ApprovedEvents";
import RejectedEvents from "./RejectedEvents";


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("manage-ngo");
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    navigate("/admin"); // No longer needed as we're not navigating away
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white p-6 flex flex-col justify-between shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-center mb-8 text-indigo-300">
            Admin Dashboard
          </h2>
          <nav className="space-y-4">
            {/* Sidebar Links with Icons */}
            <div
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                activeTab === "manage-ngo"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => setActiveTab("manage-ngo")}
            >
              <FaUsers className="mr-3" /> Manage NGO Users
            </div>
            <div
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                activeTab === "manage-volunteer"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => setActiveTab("manage-volunteer")}
            >
              <FaUsers className="mr-3" /> Manage Volunteer Users
            </div>
            <div
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                activeTab === "approve-events"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => setActiveTab("approve-events")}
            >
              <FaRegClipboard className="mr-3" /> Approve/Reject Events
            </div>
            <div
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                activeTab === "approved-events"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => setActiveTab("approved-events")}
            >
              <FaCheck className="mr-3" /> Approved Events
            </div>
            <div
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                activeTab === "rejected-events"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => setActiveTab("rejected-events")}
            >
              <FaTimes className="mr-3" /> Rejected Events
            </div>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full bg-red-500 px-4 py-3 rounded-lg hover:bg-red-600 transition-all text-white shadow-md"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white rounded-l-lg shadow-lg overflow-y-auto">
        {/* Displaying the components based on the active tab */}
        {activeTab === "manage-ngo" && <ManageNGO />}
        {activeTab === "manage-volunteer" && <ManageVolunteer />}
        {activeTab === "approve-events" && <ApproveEvents />}
        {activeTab === "approved-events" && <ApprovedEvents />}
        {activeTab === "rejected-events" && <RejectedEvents />}
      </main>
    </div>
  );
};

export default AdminDashboard;