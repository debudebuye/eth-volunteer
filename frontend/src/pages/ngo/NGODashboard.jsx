import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "../../store/authStore";

const NgoDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.error("No valid NGO session found. Redirecting to login...");
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">NGO Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.organization || user?.name || 'NGO'}</h2>
        <p className="text-gray-700">Manage your events, track volunteer participation, and more.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Create Event Card */}
          <div
            className="bg-white p-6 shadow-lg rounded-lg text-center cursor-pointer hover:bg-gray-100"
            onClick={() => navigate("/ngo/create-event")}
          >
            <h3 className="text-lg font-bold">📅 Create Event</h3>
            <p className="text-gray-600">Post and manage your events.</p>
          </div>

          {/* Manage Events Card */}
          <div
            className="bg-white p-6 shadow-lg rounded-lg text-center cursor-pointer hover:bg-gray-100"
            onClick={() => navigate("/ngo/manage-events")}
          >
            <h3 className="text-lg font-bold">🛠️ Manage Events</h3>
            <p className="text-gray-600">Update or delete your events.</p>
          </div>

          {/* Track Events Card */}
          <div
            className="bg-white p-6 shadow-lg rounded-lg text-center cursor-pointer hover:bg-gray-100"
            onClick={() => navigate("/ngo/track-events")}
          >
            <h3 className="text-lg font-bold">📊 Track Events</h3>
            <p className="text-gray-600">View comments, likes, and participants.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;