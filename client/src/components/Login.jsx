"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Calendar, UserCircle, Activity, ArrowRight, Loader2 } from "lucide-react";

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
  const handleLoginChange = (e) =>
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) =>
    setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });

  // Handle login submit
  const handleLoginSubmit = async (e) => {
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
  const handleRegisterSubmit = async (e) => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Left Side - Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 font-poppins">MIND Companion</h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Your personal AI assistant for mental wellness. Track your journey, get support, and thrive.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Personalized AI Therapy</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Daily Routine & Emotion Tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Secure & Private Environment</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="p-8 md:p-12 bg-white/80">
          <div className="mb-8 flex justify-center bg-gray-100/50 p-1 rounded-full relative">
            <motion.div
              layoutId="activeTab"
              className={`absolute top-1 bottom-1 ${activeTab === 'login' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+4px)] w-[calc(50%-8px)]'} bg-white rounded-full shadow-sm z-0 transition-all duration-300`}
            />
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 py-2 text-sm font-medium rounded-full relative z-10 transition-colors ${activeTab === "login" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`w-1/2 py-2 text-sm font-medium rounded-full relative z-10 transition-colors ${activeTab === "register" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-sm text-gray-500">Sign in to continue your wellness journey</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={loginFormData.email}
                        onChange={handleLoginChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <button type="button" className="text-xs text-blue-600 hover:underline">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="password"
                        type="password"
                        value={loginFormData.password}
                        onChange={handleLoginChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>Sign In</span><ArrowRight className="h-5 w-5" /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-sm text-gray-500">Start your journey with us today</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 ml-1">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          name="name"
                          value={registerFormData.name}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                          placeholder="Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          value={registerFormData.email}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                          placeholder="Email"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        name="password"
                        type="password"
                        value={registerFormData.password}
                        onChange={handleRegisterChange}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 ml-1">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          name="age"
                          type="number"
                          value={registerFormData.age}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                          placeholder="Age"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 ml-1">Gender</label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          name="gender"
                          value={registerFormData.gender}
                          onChange={handleRegisterChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>Create Account</span><ArrowRight className="h-5 w-5" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                {error}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
