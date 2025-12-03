import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import Toast from "../../components/Toast";

const RegisterNGO = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const emailCheckTimeout = useRef(null);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  // Check email availability with debouncing
  useEffect(() => {
    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      // Clear previous timeout
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }

      // Set new timeout for debouncing
      emailCheckTimeout.current = setTimeout(async () => {
        setEmailChecking(true);
        try {
          const response = await authAPI.checkEmail(formData.email);
          const { available, message } = response.data.data;
          setEmailAvailable(available);
          
          if (!available) {
            setErrors(prev => ({ 
              ...prev, 
              email: message
            }));
          } else {
            // Clear email error if it was about availability
            setErrors(prev => {
              const newErrors = { ...prev };
              if (newErrors.email?.includes('already registered')) {
                delete newErrors.email;
              }
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Error checking email:', error);
        } finally {
          setEmailChecking(false);
        }
      }, 500); // 500ms debounce
    } else {
      setEmailAvailable(null);
    }

    return () => {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
    };
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Reset email availability when email changes
    if (name === 'email') {
      setEmailAvailable(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid) {
      newErrors.password = "Password does not meet requirements";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Organization validation
    if (!formData.organization.trim()) {
      newErrors.organization = "Organization name is required";
    } else if (formData.organization.length < 2) {
      newErrors.organization = "Organization name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if email is available before submitting
    if (emailAvailable === false) {
      setToast({ message: "Please use a different email address", type: "error" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...registrationData } = formData;
      
      const response = await authAPI.registerNGO(registrationData);

      setToast({ message: "Registration successful! Redirecting to login...", type: "success" });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setToast({ message: errorMessage, type: "error" });
      
      // Handle backend validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-3xl font-bold text-gray-900">Register as NGO</h2>
          <p className="text-gray-600 mt-2">Create your organization account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="John Doe"
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="ngo@example.com"
                onChange={handleChange}
                className={`w-full p-3 pr-10 border ${
                  errors.email ? "border-red-500" : 
                  emailAvailable === true ? "border-green-500" :
                  "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition`}
              />
              {emailChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!emailChecking && emailAvailable === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-xl">
                  ✓
                </div>
              )}
              {!emailChecking && emailAvailable === false && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xl">
                  ✗
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {!errors.email && emailAvailable === true && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span> Email is available
              </p>
            )}
          </div>

          {/* Organization Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              placeholder="Help Ethiopia NGO"
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.organization ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition`}
            />
            {errors.organization && (
              <p className="text-red-500 text-sm mt-1">{errors.organization}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                placeholder="Enter password"
                onChange={handleChange}
                className={`w-full p-3 pr-12 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <div className={`text-xs flex items-center ${passwordRequirements.length ? "text-green-600" : "text-gray-500"}`}>
                    <span className="mr-2">{passwordRequirements.length ? "✓" : "○"}</span>
                    At least 8 characters
                  </div>
                  <div className={`text-xs flex items-center ${passwordRequirements.uppercase ? "text-green-600" : "text-gray-500"}`}>
                    <span className="mr-2">{passwordRequirements.uppercase ? "✓" : "○"}</span>
                    One uppercase letter
                  </div>
                  <div className={`text-xs flex items-center ${passwordRequirements.lowercase ? "text-green-600" : "text-gray-500"}`}>
                    <span className="mr-2">{passwordRequirements.lowercase ? "✓" : "○"}</span>
                    One lowercase letter
                  </div>
                  <div className={`text-xs flex items-center ${passwordRequirements.number ? "text-green-600" : "text-gray-500"}`}>
                    <span className="mr-2">{passwordRequirements.number ? "✓" : "○"}</span>
                    One number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Re-enter password"
                onChange={handleChange}
                className={`w-full p-3 pr-12 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span> Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            Create NGO Account
          </button>
        </form>

        {/* Already have an account? */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-green-600 font-semibold hover:text-green-700 hover:underline transition"
            >
              Login here
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
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

export default RegisterNGO;
