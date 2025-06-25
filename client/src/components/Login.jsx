"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loginFormData, setLoginFormData] = useState({ email: "", password: "" });
  const [registerFormData, setRegisterFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "",
    dailyRoutine: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle form changes
  const handleLoginChange = e =>
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  const handleRegisterChange = e =>
    setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });

  // Handle login submit
  const handleLoginSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("https://mental-health-r9h9.onrender.com/api/login", loginFormData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submit
  const handleRegisterSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("https://mental-health-r9h9.onrender.com/api/signup", registerFormData);
      setSuccessMessage("Signup successful! Please login.");
      setTimeout(() => setActiveTab("login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-none">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center rounded-t-lg">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <div className="text-3xl font-bold text-blue-600">AI</div>
            </div>
            <h1 className="text-3xl font-bold">Mental Wellness Companion</h1>
            <p className="text-blue-100 text-lg">
              {activeTab === "login" ? "Welcome back!" : "Join us for instant support"}
            </p>
          </div>

          <div className="px-6 pt-6">
            <div className="w-full grid grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
              <button
                className={`py-2 text-center font-medium ${
                  activeTab === "login"
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`py-2 text-center font-medium ${
                  activeTab === "register"
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-start">
                <svg
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg flex items-start">
                <svg
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <div>
                  <h3 className="font-medium">Success</h3>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}

            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={loginFormData.email}
                    onChange={handleLoginChange}
                    placeholder="you@example.com"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button type="button" className="text-xs text-blue-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={loginFormData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Logging in...
                    </div>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="register-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={registerFormData.name}
                    onChange={handleRegisterChange}
                    placeholder="Your Name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={registerFormData.email}
                    onChange={handleRegisterChange}
                    placeholder="you@example.com"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    value={registerFormData.password}
                    onChange={handleRegisterChange}
                    placeholder="••••••••"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="register-age"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Age
                    </label>
                    <input
                      id="register-age"
                      name="age"
                      type="number"
                      value={registerFormData.age}
                      onChange={handleRegisterChange}
                      placeholder="25"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="register-gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Gender
                    </label>
                    <select
                      id="register-gender"
                      name="gender"
                      value={registerFormData.gender}
                      onChange={handleRegisterChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-routine"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Daily Routine <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    id="register-routine"
                    name="dailyRoutine"
                    value={registerFormData.dailyRoutine}
                    onChange={handleRegisterChange}
                    placeholder="e.g., Wake up at 7, work 9-5, exercise in the evening..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  ></textarea>
                  <p className="text-xs text-gray-500">
                    Sharing your routine helps us provide more personalized support.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="p-6 pt-0">
            <div className="w-full text-center text-sm text-gray-500">
              {activeTab === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => setActiveTab("register")}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => setActiveTab("login")}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          By using this service, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
