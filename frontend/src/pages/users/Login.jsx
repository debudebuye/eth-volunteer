import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Check if the response is successful
      if (!response.ok) {
        let errorMessage = "Login failed.";
        try {
          // Attempt to parse the response as JSON
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (parseError) {
          // Handle non-JSON responses
          errorMessage = response.statusText || errorMessage;
        }
        alert(errorMessage);
        return;
      }

      // Parse the JSON response if successful
      const data = await response.json();
      console.log("Login response:", data); // Debugging

      if (data.token) {
        // Check if the user is blocked
        if (data.isBlocked) {
          // Redirect to blocked page
         
          navigate("/user/UserBlocked");
        localStorage.setItem("user", JSON.stringify(data));

          return;
        }

        // Save all user data in localStorage
        localStorage.setItem("user", JSON.stringify(data));

        // Redirect based on user role
        if (data.role === "volunteer") {
          navigate("/volunteerdashboard");
        } else {
          alert("Unknown role! Cannot determine where to navigate.");
        }
      } else {
        alert("Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };


  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login as volunteer</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          if you don't have account?{" "}
          <span
            onClick={() => navigate("/register-volunteer")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
