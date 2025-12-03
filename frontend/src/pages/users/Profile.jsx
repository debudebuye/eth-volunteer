import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api.config";
import useAuthStore from "../../store/authStore";
import Toast from "../../components/Toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, role } = useAuthStore();
  const [user, setUser] = useState({
    name: "",
    email: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isAuthenticated || !authUser || !authUser.email) {
          console.error("User not authenticated or email not found");
          navigate("/login");
          return;
        }

        const email = authUser.email;
        console.log("Fetching profile for email:", email);

        const response = await fetch(`${API_URL}/users/profile/${email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          const userData = result.data?.user || result.user || result.data;
          setUser(userData);
        } else {
          console.error("Failed to fetch user data");
          if (response.status === 401) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setToast({
          message: "Failed to load profile data",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data?.user || result.user || result.data;
        useAuthStore.getState().updateUser(updatedUser);
        setUser(updatedUser);
        setToast({
          message: "Profile updated successfully! 🎉",
          type: "success",
        });
        setIsEditing(false);
      } else {
        setToast({
          message: "Failed to update profile. Please try again.",
          type: "error",
        });
        if (response.status === 401) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setToast({
        message: "Error updating profile. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setUser({
      name: authUser.name || "",
      email: authUser.email || "",
      location: authUser.location || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-5xl">
                  {role === "volunteer" ? "👤" : role === "ngo" ? "🏢" : "👨‍💼"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name || "User"}</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span>📧</span>
                  {user.email}
                </p>
                {user.location && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <span>📍</span>
                    {user.location}
                  </p>
                )}
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {role === "volunteer" ? "🌟 Volunteer" : role === "ngo" ? "🏢 NGO" : "👨‍💼 Admin"}
                  </span>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <span>✏️</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span>
            Profile Information
          </h2>

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  👤
                </span>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                    isEditing
                      ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  } outline-none`}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
                  placeholder="Email"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            {/* Location Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📍
                </span>
                <input
                  type="text"
                  name="location"
                  value={user.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                    isEditing
                      ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  } outline-none`}
                  placeholder="Enter your location"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>💾</span>
                    Save Changes
                  </span>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>❌</span>
                  Cancel
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;