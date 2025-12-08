import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Brain,
  Clock,
  User
} from "lucide-react";
import Chat from "./Chat";
import EmotionalTimeline from "./EmotionalTimeline";
import MindCompanion from "./MindCompanion";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("https://mental-health-r9h9.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Calculate average distress score
  const getAvgDistressScore = () => {
    if (!userData || !userData.interactions.length) return "N/A";
    return (
      userData.interactions.reduce((sum, int) => sum + int.distressScore, 0) /
      userData.interactions.length
    ).toFixed(1);
  };

  // Get distress level color
  const getDistressColor = score => {
    if (score < 3) return "bg-green-100 text-green-800";
    if (score < 7) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  // Get distress level text
  const getDistressLevel = score => {
    if (score < 3) return "Low";
    if (score < 7) return "Moderate";
    return "High";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Desktop */}
      <div className="bg-white border-r w-72 hidden md:flex md:flex-col fixed h-full z-30 shadow-xl shadow-blue-50/50">
        <div className="flex items-center justify-center py-8 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
              <Brain className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">MIND Companion</span>
          </div>
        </div>

        <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm border border-blue-100 flex-shrink-0">
                {userData.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-900 truncate">{userData.name}</p>
                <p className="text-xs text-blue-500 truncate font-medium">{userData.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'interactions', icon: MessageSquare, label: 'Interactions' },
              { id: 'progress', icon: TrendingUp, label: 'Progress' },
              { id: 'therapist', icon: User, label: 'Therapist', action: () => navigate("/therapist") },
              { id: 'timeline', icon: Clock, label: 'Timeline' },
              { id: 'community', icon: Users, label: 'Community' },
              { id: 'routine', icon: Calendar, label: 'Daily Routine', action: () => navigate("/daily-routine") },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${(item.action ? false : activeTab === item.id)
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                onClick={item.action || (() => setActiveTab(item.id))}
              >
                <item.icon className={`mr-3 h-5 w-5 ${(item.action ? false : activeTab === item.id) ? "text-white" : "text-gray-400 group-hover:text-blue-600"}`} />
                <span className="font-medium">{item.label}</span>
                {(item.action ? false : activeTab === item.id) && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          {/*

            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "interactions"
                ? "bg-gray-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("interactions")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
              Interactions
            </button>

            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "progress"
                ? "bg-gray-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("progress")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              Progress
            </button>

            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "therapist"
                ? "bg-gray-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => navigate("/therapist")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Therapist
            </button>
            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "timeline"
                ? "bg-gray-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("timeline")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 12h10m-5-9v18m-9-6h18"
                ></path>
              </svg>
              Emotional Timeline
            </button>
            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "community"
                ? "bg-gray-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("community")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Community
            </button>



            <button
              className="w-full flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
              onClick={() => navigate("/daily-routine")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              Daily Routine
            </button>

            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "settings"
                ? "bg-gray-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab("settings")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Settings
            </button>
          */}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full flex items-center px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-30">
        <button className="p-2 rounded-md text-gray-500" onClick={() => setMobileMenuOpen(true)}>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            AI
          </div>
          <span className="font-bold text-lg">Mental Wellness</span>
        </div>

        <button
          className={`w-full flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50`}
          onClick={async () => {
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                alert("Please log in first");
                return;
              }
              await axios.post(
                "https://mental-health-r9h9.onrender.com/api/run-whatsapp",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              alert("WhatsApp script is running in a new browser window!");
              setMobileMenuOpen(false);
            } catch (error) {
              console.error("Error running WhatsApp script:", error);
              alert("Failed to start WhatsApp script. Please try again.");
            }
          }}
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-2l4-4 4 4V16h-4z"
            ></path>
          </svg>
          Talk on WhatsApp
        </button>

        <button className="p-2 rounded-md text-gray-500" onClick={toggleChat}>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-lg p-4 z-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <span className="font-bold text-lg">Mental Wellness</span>
              </div>

              <button
                className="p-2 rounded-md text-gray-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {userData.name[0]}
                </div>
                <div>
                  <p className="font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <button
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "overview"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setActiveTab("overview");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                Overview
              </button>

              <button
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "interactions"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setActiveTab("interactions");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
                Interactions
              </button>

              <button
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "progress"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setActiveTab("progress");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                Progress
              </button>

              <button
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "timeline"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setActiveTab("timeline");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 12h10m-5-9v18m-9-6h18"
                  ></path>
                </svg>
                Emotional Timeline
              </button>

              <button
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "community"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setActiveTab("community");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Community
              </button>

              <button
                className="w-full flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  navigate("/daily-routine");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                Daily Routine
              </button>

              <button
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeTab === "settings"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setActiveTab("settings");
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                Settings
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <button
                className="w-full flex items-center px-3 py-2 rounded-md text-red-500 hover:bg-red-50"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                Logout
              </button>
            </div>
          </div>

          <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 md:ml-72 pt-16 md:pt-0 bg-gray-50/50 min-h-screen"
      >
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <h1 className="text-2xl font-bold mb-6">Welcome back, {userData.name}</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    label: "Current Distress",
                    value: getAvgDistressScore(),
                    subtext: getAvgDistressScore() !== "N/A" ? getDistressLevel(getAvgDistressScore()) : null,
                    color: getAvgDistressScore() !== "N/A"
                      ? (getDistressColor(getAvgDistressScore()).includes("green") ? "text-green-600 bg-green-50" :
                        getDistressColor(getAvgDistressScore()).includes("amber") ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50")
                      : "text-gray-600 bg-gray-50",
                    icon: Activity
                  },
                  {
                    label: "Interactions",
                    value: userData.interactions.length,
                    subtext: "Total Sessions",
                    color: "text-blue-600 bg-blue-50",
                    icon: MessageSquare
                  },
                  {
                    label: "Daily Progress",
                    value: "75%",
                    subtext: "Consistency",
                    color: "text-purple-600 bg-purple-50",
                    icon: TrendingUp
                  }
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <div className="flex items-end mt-2 space-x-2">
                          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                          {card.subtext && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${card.color.replace('text-', 'bg-').replace('bg-', 'text-').replace('50', '100').split(' ')[0]} ${card.color.split(' ')[0]}`}>
                              {card.subtext}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color}`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">Daily Wellness</h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <svg
                              className="h-5 w-5 text-amber-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                              ></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Morning Routine</p>
                            <p className="text-xs text-gray-500">Completed at 8:00 AM</p>
                          </div>
                        </div>
                        <span className="text-green-500">
                          <svg
                            className="h-6 w-6"
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
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <svg
                              className="h-5 w-5 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              ></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Work/Study Session</p>
                            <p className="text-xs text-gray-500">In Progress</p>
                          </div>
                        </div>
                        <span className="text-gray-400">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <svg
                              className="h-5 w-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                              ></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Evening Relaxation</p>
                            <p className="text-xs text-gray-500">Scheduled for 9:00 PM</p>
                          </div>
                        </div>
                        <span className="text-gray-400">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">Recent Activity</h2>
                  </div>
                  <div className="p-4">
                    {userData.interactions.length > 0 ? (
                      <div className="space-y-4">
                        {userData.interactions.slice(-3).reverse().map((interaction, i) => (
                          <div key={i} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                            <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${getDistressColor(interaction.distressScore).split(' ')[0].replace('bg-', 'bg-')}`}></div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">Interaction logged</p>
                              <p className="text-xs text-gray-500">{new Date(interaction.timestamp).toLocaleString()}</p>
                              <p className="text-sm mt-1 text-gray-600 line-clamp-2">
                                {interaction.textInput || "Voice interaction"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "interactions" && (
            <motion.div
              key="interactions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 h-full"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-8rem)]">
                <Chat />
              </div>
            </motion.div>
          )}

          {activeTab === "progress" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 mb-4">Tracking your emotional well-being over time.</p>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400">Progress charts coming soon</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <EmotionalTimeline />
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <MindCompanion />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={userData.name}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="text"
                          value={userData.email}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Preferences</h3>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates and weekly reports</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-gray-500">Use dark theme for the dashboard</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Bot Overlay */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        >
          {isChatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Assistant</h3>
                  <p className="text-xs text-blue-100 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                    Online
                  </p>
                </div>
              </div>
              <button onClick={toggleChat} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat isWidget={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default PatientDashboard;
