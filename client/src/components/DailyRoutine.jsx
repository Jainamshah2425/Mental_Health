<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ArrowLeft, Edit2, Save, X, Loader, Info, CheckCircle, AlertTriangle, Sun, Moon, Sunset, Activity, Play } from "lucide-react";

const DailyRoutine = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distressSigns, setDistressSigns] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoutine, setEditedRoutine] = useState("");
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  const [suggestedActivities, setSuggestedActivities] = useState([
    {
      id: "breathing",
      name: "Breathing Exercise",
      description: "Calm your mind with deep breathing.",
      icon: "💨",
      category: "stress",
    },
    {
      id: "journal",
      name: "Journal Prompt",
      description: "Reflect on your day with guided prompts.",
      icon: "✍️",
      category: "reflection",
    },
    {
      id: "mindfulness",
      name: "Mindfulness Activity",
      description: "Focus on the present moment.",
      icon: "🧘",
      category: "anxiety",
    },
    {
      id: "stretch",
      name: "Quick Stretch",
      description: "Relieve physical tension with a stretch.",
      icon: "🤸",
      category: "physical",
    },
    {
      id: "gratitude",
      name: "Gratitude Practice",
      description: "List three things you're grateful for today.",
      icon: "🙏",
      category: "mood",
    },
    {
      id: "sleep",
      name: "Sleep Hygiene",
      description: "Improve your sleep quality with these tips.",
      icon: "😴",
      category: "sleep",
    },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("https://mental-health-r9h9.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setEditedRoutine(res.data.dailyRoutine || "");
        analyzeRoutine(res.data.dailyRoutine);
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const analyzeRoutine = routine => {
    if (!routine) {
      setDistressSigns([
        {
          type: "info",
          message: "No routine provided yet. Add one to get personalized insights!",
        },
      ]);
      return;
    }

    const lowerRoutine = routine.toLowerCase();
    const signs = [];

    // Sleep patterns
    if (
      lowerRoutine.includes("late") ||
      lowerRoutine.includes("can't sleep") ||
      lowerRoutine.includes("insomnia") ||
      lowerRoutine.includes("tired")
    ) {
      signs.push({
        type: "warning",
        category: "sleep",
        message: "Possible sleep disruption detected.",
        suggestion: "Consider establishing a consistent sleep schedule and bedtime routine.",
      });
    }

    // Work stress
    if (
      lowerRoutine.includes("busy") ||
      lowerRoutine.includes("deadline") ||
      lowerRoutine.includes("stress") ||
      lowerRoutine.includes("overwork")
    ) {
      signs.push({
        type: "warning",
        category: "stress",
        message: "High workload or stress indicators found.",
        suggestion:
          "Try scheduling short breaks throughout your day and practice stress management techniques.",
      });
    }

    // Social isolation
    if (
      lowerRoutine.includes("alone") ||
      lowerRoutine.includes("lonely") ||
      lowerRoutine.includes("no time for friends")
    ) {
      signs.push({
        type: "warning",
        category: "social",
        message: "Potential isolation or lack of social connection.",
        suggestion: "Consider scheduling time for social activities, even brief ones.",
      });
    }

    // Physical activity
    if (
      !lowerRoutine.includes("exercise") &&
      !lowerRoutine.includes("walk") &&
      !lowerRoutine.includes("gym")
    ) {
      signs.push({
        type: "warning",
        category: "physical",
        message: "Limited physical activity mentioned.",
        suggestion: "Even short walks can improve mood and reduce stress.",
      });
    }

    // Positive indicators
    if (
      lowerRoutine.includes("meditate") ||
      lowerRoutine.includes("exercise") ||
      lowerRoutine.includes("hobby") ||
      lowerRoutine.includes("friend")
    ) {
      signs.push({
        type: "success",
        message: "Positive wellness activities detected in your routine!",
        suggestion: "Keep up these beneficial practices.",
      });
    }

    if (signs.length === 0) {
      signs.push({
        type: "info",
        message: "Your routine looks balanced overall.",
        suggestion: "Continue monitoring how your daily activities affect your wellbeing.",
      });
    }

    setDistressSigns(signs);
  };

  const handleActivityClick = activityId => {
    navigate(`/activity/${activityId}`);
  };

  const handleSaveRoutine = async () => {
    setSavingRoutine(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://mental-health-r9h9.onrender.com/api/update-profile",
        { dailyRoutine: editedRoutine },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData({ ...userData, dailyRoutine: editedRoutine });
      analyzeRoutine(editedRoutine);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating routine:", error);
    } finally {
      setSavingRoutine(false);
    }
  };

  // Filter activities based on detected issues
  const getRecommendedActivities = () => {
    const categories = distressSigns
      .filter(sign => sign.type === "warning")
      .map(sign => sign.category);

    if (categories.length === 0) {
      return suggestedActivities;
    }

    // Prioritize activities that match detected issues
    return [
      ...suggestedActivities.filter(activity => categories.includes(activity.category)),
      ...suggestedActivities.filter(activity => !categories.includes(activity.category)),
    ];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div className="h-8 w-1/3 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="h-32 w-full bg-gray-200 rounded-md"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded-md"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto p-6 max-w-5xl"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              Daily Routine Analysis
            </h2>

            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 rounded-xl transition-all duration-200 flex items-center shadow-sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="w-full mb-6 grid grid-cols-2 bg-gray-100/50 p-1 rounded-xl">
          <button
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "analysis"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("analysis")}
          >
            Daily Analysis
          </button>
          <button
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "activities"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("activities")}
          >
            Recommended Activities
          </button>
        </div>


        <div className="p-6 pt-0">

          <AnimatePresence mode="wait">
            {activeTab === "analysis" && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Your Daily Routine</h3>

                      {!isEditing ? (
                        <button
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Routine
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                            onClick={() => {
                              setIsEditing(false);
                              setEditedRoutine(userData.dailyRoutine || "");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </button>

                          <button
                            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg flex items-center shadow-sm transition-all hover:bg-blue-700 ${savingRoutine ? "opacity-70 cursor-not-allowed" : ""
                              }`}
                            onClick={handleSaveRoutine}
                            disabled={savingRoutine}
                          >
                            {savingRoutine ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    {!isEditing ? (
                      userData.dailyRoutine ? (
                        <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                          {userData.dailyRoutine}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">You haven't set a daily routine yet.</p>
                          <button
                            className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-transparent rounded-lg transition-colors flex items-center mx-auto"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Add Routine
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          value={editedRoutine}
                          onChange={e => setEditedRoutine(e.target.value)}
                          placeholder="Describe your typical daily routine here..."
                          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[150px] bg-gray-50 resize-y transition-all"
                        ></textarea>
                        <p className="text-xs text-gray-500">
                          Include details like wake-up time, work hours, meals, exercise, social
                          activities, and bedtime.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg mr-2">
                        <Activity className="h-5 w-5" />
                      </div>
                      Analysis & Insights
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
                      {distressSigns.map((sign, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl flex items-start border ${sign.type === "warning"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : sign.type === "success"
                              ? "bg-green-50 text-green-800 border-green-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}
                        >
                          {sign.type === "warning" && (
                            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                          )}
                          {sign.type === "success" && (
                            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                          )}
                          {sign.type === "info" && (
                            <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                          )}

                          <div>
                            <p className="font-semibold">{sign.message}</p>
                            {sign.suggestion && <p className="text-sm mt-1 opacity-90">{sign.suggestion}</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Daily Pattern</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center mr-2 text-orange-500">
                            <Sun className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">Morning</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-100 mx-3 rounded-full"></div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2 text-blue-500">
                            <Sunset className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">Afternoon</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-100 mx-3 rounded-full"></div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-2 text-indigo-500">
                            <Moon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">Evening</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "activities" && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {getRecommendedActivities().map(activity => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleActivityClick(activity.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">{activity.icon}</div>
                        {distressSigns.some(
                          sign => sign.type === "warning" && sign.category === activity.category
                        ) && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Recommended
                            </span>
                          )}
                      </div>
                      <h3 className="text-lg font-medium mb-2">{activity.name}</h3>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <div className="bg-blue-50 p-3 text-center">
                      <span className="text-sm font-medium text-blue-600">Start Activity</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </motion.div >
  );
};

export default DailyRoutine;
=======
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DailyRoutine = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distressSigns, setDistressSigns] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoutine, setEditedRoutine] = useState("");
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  const [suggestedActivities, setSuggestedActivities] = useState([
    {
      id: "breathing",
      name: "Breathing Exercise",
      description: "Calm your mind with deep breathing.",
      icon: "💨",
      category: "stress",
    },
    {
      id: "journal",
      name: "Journal Prompt",
      description: "Reflect on your day with guided prompts.",
      icon: "✍️",
      category: "reflection",
    },
    {
      id: "mindfulness",
      name: "Mindfulness Activity",
      description: "Focus on the present moment.",
      icon: "🧘",
      category: "anxiety",
    },
    {
      id: "stretch",
      name: "Quick Stretch",
      description: "Relieve physical tension with a stretch.",
      icon: "🤸",
      category: "physical",
    },
    {
      id: "gratitude",
      name: "Gratitude Practice",
      description: "List three things you're grateful for today.",
      icon: "🙏",
      category: "mood",
    },
    {
      id: "sleep",
      name: "Sleep Hygiene",
      description: "Improve your sleep quality with these tips.",
      icon: "😴",
      category: "sleep",
    },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("https://mental-health-r9h9.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setEditedRoutine(res.data.dailyRoutine || "");
        analyzeRoutine(res.data.dailyRoutine);
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const analyzeRoutine = routine => {
    if (!routine) {
      setDistressSigns([
        {
          type: "info",
          message: "No routine provided yet. Add one to get personalized insights!",
        },
      ]);
      return;
    }

    const lowerRoutine = routine.toLowerCase();
    const signs = [];

    // Sleep patterns
    if (
      lowerRoutine.includes("late") ||
      lowerRoutine.includes("can't sleep") ||
      lowerRoutine.includes("insomnia") ||
      lowerRoutine.includes("tired")
    ) {
      signs.push({
        type: "warning",
        category: "sleep",
        message: "Possible sleep disruption detected.",
        suggestion: "Consider establishing a consistent sleep schedule and bedtime routine.",
      });
    }

    // Work stress
    if (
      lowerRoutine.includes("busy") ||
      lowerRoutine.includes("deadline") ||
      lowerRoutine.includes("stress") ||
      lowerRoutine.includes("overwork")
    ) {
      signs.push({
        type: "warning",
        category: "stress",
        message: "High workload or stress indicators found.",
        suggestion:
          "Try scheduling short breaks throughout your day and practice stress management techniques.",
      });
    }

    // Social isolation
    if (
      lowerRoutine.includes("alone") ||
      lowerRoutine.includes("lonely") ||
      lowerRoutine.includes("no time for friends")
    ) {
      signs.push({
        type: "warning",
        category: "social",
        message: "Potential isolation or lack of social connection.",
        suggestion: "Consider scheduling time for social activities, even brief ones.",
      });
    }

    // Physical activity
    if (
      !lowerRoutine.includes("exercise") &&
      !lowerRoutine.includes("walk") &&
      !lowerRoutine.includes("gym")
    ) {
      signs.push({
        type: "warning",
        category: "physical",
        message: "Limited physical activity mentioned.",
        suggestion: "Even short walks can improve mood and reduce stress.",
      });
    }

    // Positive indicators
    if (
      lowerRoutine.includes("meditate") ||
      lowerRoutine.includes("exercise") ||
      lowerRoutine.includes("hobby") ||
      lowerRoutine.includes("friend")
    ) {
      signs.push({
        type: "success",
        message: "Positive wellness activities detected in your routine!",
        suggestion: "Keep up these beneficial practices.",
      });
    }

    if (signs.length === 0) {
      signs.push({
        type: "info",
        message: "Your routine looks balanced overall.",
        suggestion: "Continue monitoring how your daily activities affect your wellbeing.",
      });
    }

    setDistressSigns(signs);
  };

  const handleActivityClick = activityId => {
    navigate(`/activity/${activityId}`);
  };

  const handleSaveRoutine = async () => {
    setSavingRoutine(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://mental-health-r9h9.onrender.com/api/update-profile",
        { dailyRoutine: editedRoutine },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData({ ...userData, dailyRoutine: editedRoutine });
      analyzeRoutine(editedRoutine);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating routine:", error);
    } finally {
      setSavingRoutine(false);
    }
  };

  // Filter activities based on detected issues
  const getRecommendedActivities = () => {
    const categories = distressSigns
      .filter(sign => sign.type === "warning")
      .map(sign => sign.category);

    if (categories.length === 0) {
      return suggestedActivities;
    }

    // Prioritize activities that match detected issues
    return [
      ...suggestedActivities.filter(activity => categories.includes(activity.category)),
      ...suggestedActivities.filter(activity => !categories.includes(activity.category)),
    ];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div className="h-8 w-1/3 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="h-32 w-full bg-gray-200 rounded-md"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded-md"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md border-none">
        <div className="p-6 pb-2 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold text-blue-600 flex items-center">
              <svg
                className="mr-2 h-6 w-6"
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
              Daily Routine Analysis
            </h2>

            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center"
              onClick={() => navigate("/dashboard")}
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="w-full mb-4 grid grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
            <button
              className={`py-2 text-center font-medium ${
                activeTab === "analysis"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("analysis")}
            >
              Analysis
            </button>
            <button
              className={`py-2 text-center font-medium ${
                activeTab === "activities"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("activities")}
            >
              Recommended Activities
            </button>
          </div>

          {activeTab === "analysis" && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Your Daily Routine</h3>

                    {!isEditing ? (
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center"
                        onClick={() => setIsEditing(true)}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedRoutine(userData.dailyRoutine || "");
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
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                          Cancel
                        </button>

                        <button
                          className={`px-3 py-1 text-sm bg-blue-600 text-white rounded-md flex items-center ${
                            savingRoutine ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                          }`}
                          onClick={handleSaveRoutine}
                          disabled={savingRoutine}
                        >
                          {savingRoutine ? (
                            <>
                              <svg
                                className="mr-2 h-4 w-4 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
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
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {!isEditing ? (
                    userData.dailyRoutine ? (
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                        {userData.dailyRoutine}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">You haven't set a daily routine yet.</p>
                        <button
                          className="mt-2 px-3 py-1 text-sm border border-gray-300 rounded-md"
                          onClick={() => setIsEditing(true)}
                        >
                          Add Routine
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={editedRoutine}
                        onChange={e => setEditedRoutine(e.target.value)}
                        placeholder="Describe your typical daily routine here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                      ></textarea>
                      <p className="text-xs text-gray-500">
                        Include details like wake-up time, work hours, meals, exercise, social
                        activities, and bedtime.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium flex items-center">
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                    Analysis & Insights
                  </h3>
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    {distressSigns.map((sign, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg flex items-start ${
                          sign.type === "warning"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : sign.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {sign.type === "warning" && (
                          <svg
                            className="h-5 w-5 mr-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            ></path>
                          </svg>
                        )}
                        {sign.type === "success" && (
                          <svg
                            className="h-5 w-5 mr-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        )}
                        {sign.type === "info" && (
                          <svg
                            className="h-5 w-5 mr-3 flex-shrink-0"
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
                        )}

                        <div>
                          <p className="font-medium">{sign.message}</p>
                          {sign.suggestion && <p className="text-sm mt-1">{sign.suggestion}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Daily Pattern</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg
                            className="h-4 w-4 text-amber-500"
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
                        <span className="text-sm">Morning</span>
                      </div>
                      <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
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
                        <span className="text-sm">Afternoon</span>
                      </div>
                      <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg
                            className="h-4 w-4 text-indigo-500"
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
                        <span className="text-sm">Evening</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedActivities().map(activity => (
                <div
                  key={activity.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleActivityClick(activity.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{activity.icon}</div>
                      {distressSigns.some(
                        sign => sign.type === "warning" && sign.category === activity.category
                      ) && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Recommended
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium mb-2">{activity.name}</h3>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <div className="bg-blue-50 p-3 text-center">
                    <span className="text-sm font-medium text-blue-600">Start Activity</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyRoutine;
>>>>>>> ce9381768a87d83fb9fb987c4c89e5ce669f135c
