import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat"; // Adjust the path based on your file structure
import EmotionalTimeline from "./EmotionalTimeline"; // Adjust the path based on your file structure
import MindCompanion from "./MindCompanion"; // Adjust the path based on your file structure

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
      <div className="bg-white border-r w-64 hidden md:flex md:flex-col fixed h-full z-30">
        <div className="flex items-center justify-center py-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="font-bold text-lg">Mental Wellness</span>
          </div>
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
          <div className="px-3 mb-6">
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

          <div className="space-y-1 px-3">
            <button
              className={`w-full flex items-center px-3 py-2 rounded-md ${
                activeTab === "overview"
                  ? "bg-gray-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("overview")}
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
              className={`w-full flex items-center px-3 py-2 rounded-md ${
                activeTab === "interactions"
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
              className={`w-full flex items-center px-3 py-2 rounded-md ${
                activeTab === "progress"
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
  className={`w-full flex items-center px-3 py-2 rounded-md ${
    activeTab === "therapist"
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
              className={`w-full flex items-center px-3 py-2 rounded-md ${
                activeTab === "timeline"
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
              className={`w-full flex items-center px-3 py-2 rounded-md ${
                activeTab === "community"
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
              className={`w-full flex items-center px-3 py-2 rounded-md ${
                activeTab === "settings"
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
          </div>
        </div>

        <div className="p-3 border-t">
          <button
            className="w-full flex items-center px-3 py-2 rounded-md text-red-500 hover:bg-red-50"
            onClick={handleLogout}
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
                "http://localhost:5000/api/run-whatsapp",
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
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeTab === "overview"
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
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeTab === "interactions"
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
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeTab === "progress"
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
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeTab === "timeline"
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
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeTab === "community"
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
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeTab === "settings"
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
      <div className="flex-1 md:ml-64 pt-16 md:pt-0">
        {activeTab === "overview" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome back, {userData.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Distress</p>
                    <div className="flex items-center mt-1">
                      <p className="text-2xl font-bold">{getAvgDistressScore()}</p>
                      {getAvgDistressScore() !== "N/A" && (
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                            getAvgDistressScore()
                          )}`}
                        >
                          {getDistressLevel(getAvgDistressScore())}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Interactions</p>
                    <p className="text-2xl font-bold">{userData.interactions.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Daily Progress</p>
                    <p className="text-2xl font-bold">75%</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
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
                          <p className="text-sm text-gray-500">Start your day mindfully</p>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                        onClick={() => navigate("/activity/breathing")}
                      >
                        Start
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg
                            className="h-5 w-5 text-blue-600"
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
                          <p className="font-medium">Afternoon Check-in</p>
                          <p className="text-sm text-gray-500">Reset and refocus</p>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                        onClick={() => navigate("/activity/mindfulness")}
                      >
                        Start
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg
                            className="h-5 w-5 text-indigo-500"
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
                          <p className="font-medium">Evening Reflection</p>
                          <p className="text-sm text-gray-500">Wind down and process</p>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                        onClick={() => navigate("/activity/journal")}
                      >
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Recent Interactions</h2>
                </div>
                <div className="p-4">
                  {userData.interactions.length > 0 ? (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                      {userData.interactions
                        .slice(-3)
                        .reverse()
                        .map((interaction, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium text-sm">
                                {interaction.textInput || interaction.voiceInput}
                              </p>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                                  interaction.distressScore
                                )}`}
                              >
                                {interaction.distressScore}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                              {interaction.suggestedAction}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <svg
                                className="h-3 w-3 mr-1"
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
                              {new Date(interaction.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        className="h-10 w-10 mx-auto text-gray-400 opacity-20 mb-2"
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
                      <p className="text-gray-500">No interactions yet</p>
                      <button
                        className="mt-2 px-3 py-1 text-sm border border-gray-300 rounded-md"
                        onClick={toggleChat}
                      >
                        Start a conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Your Interactions</h1>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">All Conversations</h2>
              </div>
              <div className="p-4">
                {userData.interactions.length > 0 ? (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {userData.interactions.reverse().map((interaction, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-1 font-bold">
                              {userData.name[0]}
                            </div>
                            <div>
                              <p className="font-medium">
                                {interaction.textInput || interaction.voiceInput}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(interaction.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                              interaction.distressScore
                            )}`}
                          >
                            Score: {interaction.distressScore}
                          </span>
                        </div>

                        <div className="ml-11 p-3 bg-blue-50 rounded-lg mt-2">
                          <div className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 text-xs font-bold">
                              AI
                            </div>
                            <p className="text-sm">{interaction.suggestedAction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="h-12 w-12 mx-auto text-gray-400 opacity-20 mb-3"
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
                    <h3 className="text-lg font-medium">No interactions yet</h3>
                    <p className="text-gray-500 mt-1 mb-4">
                      Start a conversation with your AI companion
                    </p>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      onClick={toggleChat}
                    >
                      Start Chatting
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Your Wellness Progress</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Distress Trend</h2>
                </div>
                <div className="p-4 h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="h-16 w-16 mx-auto text-gray-400 opacity-20 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                    <p className="text-gray-500">Distress level visualization will appear here</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Activity Completion</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Breathing Exercises</span>
                        <span>3/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Journaling</span>
                        <span>2/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mindfulness</span>
                        <span>4/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Physical Activity</span>
                        <span>1/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Weekly Goals</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg
                        className="h-5 w-5 text-green-600"
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
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Complete 3 breathing exercises</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Journal at least twice this week</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Maintain average distress below 5</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Your Emotional Timeline</h1>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Mood Insights</h2>
              </div>
              <div className="p-4">
                {/* This will be dynamically populated by the EmotionalTimeline component */}
                <EmotionalTimeline />
              </div>
            </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Community</h1>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Mind Companion Community</h2>
              </div>
              <div className="p-4">
                <h1>
                  We are currently building the community features. Stay tuned for updates!
                </h1>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Profile Information</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                      {userData.name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{userData.name}</h3>
                      <p className="text-gray-500">{userData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Age</p>
                      <p className="font-medium">{userData.age || "Not set"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-medium">{userData.gender || "Not set"}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-md">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Notification Settings</h2>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 mb-4">
                    Configure how and when you receive notifications
                  </p>
                  <button className="px-4 py-2 border border-gray-300 rounded-md">
                    Manage Notifications
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Privacy Settings</h2>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 mb-4">Control your data and privacy preferences</p>
                  <button className="px-4 py-2 border border-gray-300 rounded-md">
                    Manage Privacy
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md mt-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-red-500">Danger Zone</h2>
              </div>
              <div className="p-4">
                <p className="text-gray-500 mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-4 py-2 border border-red-200 text-red-500 rounded-md hover:bg-red-50">
                    Delete All Interactions
                  </button>
                  <button className="px-4 py-2 border border-red-200 text-red-500 rounded-md hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Component */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-full sm:w-96 z-30">
          <div className="relative">
            <button
              className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-gray-200"
              onClick={toggleChat}
            >
              <svg
                className="h-4 w-4"
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
            <Chat isFloating={true} />
          </div>
        </div>
      )}

      {/* Mobile Chat Button */}
      <div className="fixed bottom-4 right-4 md:hidden z-20">
        {!isChatOpen && (
          <button
            className="h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
            onClick={toggleChat}
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
