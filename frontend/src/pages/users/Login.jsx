import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Toast from "../../components/Toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Function to determine navigation based on user role
  const navigateByRole = (user) => {
    // Check if user is blocked
    if (user.isBlocked || user.status === 'blocked') {
      setToast({ 
        message: "Your account has been blocked. Please contact support.", 
        type: "error" 
      });
      setTimeout(() => navigate("/user/UserBlocked"), 2000);
      return;
    }

    // Navigate based on role
    const roleRoutes = {
      'volunteer': '/volunteerdashboard',
      'user': '/volunteerdashboard',
      'ngo': '/ngodashboard',
      'admin': '/admin-dashboard',
    };

    const route = roleRoutes[user.role?.toLowerCase()];
    
    if (route) {
      const userName = user.name || user.organization || 'User';
      setToast({ 
        message: `Welcome back, ${userName}!`, 
        type: "success" 
      });
      setTimeout(() => navigate(route), 1500);
    } else {
      setToast({ 
        message: "Unknown role! Cannot determine where to navigate.", 
        type: "error" 
      });
    }
  };

  // Unified login that tries all user types
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const credentials = { email, password };
    
    try {
      // Try volunteer login first
      let result = await login(credentials, 'volunteer');
      
      // If volunteer login fails, try NGO
      if (!result.success) {
        result = await login(credentials, 'ngo');
      }
      
      // If NGO login fails, try Admin
      if (!result.success) {
        result = await login(credentials, 'admin');
      }

      // Handle the result
      if (result.success && result.user) {
        console.log('Login successful! User data:', result.user);
        console.log('User role:', result.user.role);
        navigateByRole(result.user);
      } else {
        setToast({ 
          message: result.error || "Invalid email or password!", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setToast({ 
        message: "An error occurred during login. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🇪🇹</div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Don't have an account? */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-3">Don't have an account?</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/register-volunteer")}
              className="flex-1 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
            >
              👤 Volunteer
            </button>
            <button
              onClick={() => navigate("/register-ngo")}
              className="flex-1 py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
            >
              🏢 NGO
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 text-sm hover:text-gray-700 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
