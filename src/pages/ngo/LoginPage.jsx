import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/login-ngo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            

            if (response.ok && data.token) {


                if (data.status === "blocked") {
                    navigate("/blocked-ngo"); // Redirect to blocked page
                    return;
                }

                
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("ngo", JSON.stringify({ role: data.role })); // Store NGO object

                navigate("/ngodashboard");
            } else {
                setError(data.message || "Login failed!");
            }

        } catch (error) {
            console.error("Login error:", error);
            setError("An error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login as NGO</h2>

                {error && <div className="text-red-600 text-center mb-4">{error}</div>}

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
                        className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    If you don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register-ngo")}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
