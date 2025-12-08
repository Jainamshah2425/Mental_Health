<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("routine");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("https://mental-health-r9h9.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded-md mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
          </div>
          <div className="mt-8">
            <div className="h-6 w-1/4 bg-gray-200 rounded-md mb-4"></div>
            <div className="space-y-3">
              <div className="h-24 w-full bg-gray-200 rounded-md"></div>
              <div className="h-24 w-full bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Calculate average distress score
  const avgDistressScore = profile.interactions.length
    ? (
        profile.interactions.reduce((sum, int) => sum + int.distressScore, 0) /
        profile.interactions.length
      ).toFixed(1)
    : "N/A";

  // Get distress level text
  const getDistressLevel = score => {
    if (score < 3) return "Low";
    if (score < 7) return "Moderate";
    return "High";
  };

  // Get distress level color
  const getDistressColor = score => {
    if (score < 3) return "bg-green-100 text-green-800";
    if (score < 7) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md border-none">
        <div className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-600">Your Profile</h2>
            <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-200">
              {profile.interactions.length} Interactions
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
                <div className="relative h-24 w-24 mb-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {profile.name.charAt(0)}
                </div>
                <h3 className="text-xl font-medium">{profile.name}</h3>
                <p className="text-gray-500">{profile.email}</p>

                <div className="w-full mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
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
                        ></path>
                      </svg>
                      Age
                    </span>
                    <span className="font-medium">{profile.age || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
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
                        ></path>
                      </svg>
                      Gender
                    </span>
                    <span className="font-medium">{profile.gender || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
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
                      Avg. Distress
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                        avgDistressScore
                      )}`}
                    >
                      {avgDistressScore} - {getDistressLevel(avgDistressScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="w-full">
                <div className="w-full grid grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
                  <button
                    className={`py-2 text-center font-medium ${
                      activeTab === "routine"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab("routine")}
                  >
                    Daily Routine
                  </button>
                  <button
                    className={`py-2 text-center font-medium ${
                      activeTab === "interactions"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab("interactions")}
                  >
                    Recent Interactions
                  </button>
                </div>

                <div className="mt-4">
                  {activeTab === "routine" && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <svg
                          className="h-5 w-5 mr-2 text-blue-600"
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
                        Your Daily Routine
                      </h3>
                      {profile.dailyRoutine ? (
                        <p className="text-gray-600 whitespace-pre-line">{profile.dailyRoutine}</p>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">You haven't set a daily routine yet.</p>
                          <p className="text-sm mt-2">
                            Adding your routine helps us provide better recommendations.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "interactions" && (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {profile.interactions.length > 0 ? (
                        profile.interactions
                          .slice(-5)
                          .reverse()
                          .map((interaction, index) => (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Conversation</h4>
                                <div className="flex items-center text-xs text-gray-500">
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
                                </div>
                              </div>

                              <div className="mb-2 pb-2 border-b border-blue-100">
                                <p className="text-sm text-gray-500 mb-1">You said:</p>
                                <p>{interaction.textInput || interaction.voiceInput}</p>
                              </div>

                              <div className="mb-2">
                                <p className="text-sm text-gray-500 mb-1">AI suggested:</p>
                                <p>{interaction.suggestedAction}</p>
                              </div>

                              <div className="flex justify-end">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                                    interaction.distressScore
                                  )}`}
                                >
                                  Distress: {interaction.distressScore}
                                </span>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-10">
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
                          <p className="text-gray-500">No interactions yet.</p>
                          <p className="text-sm mt-2">
                            Start a conversation with your AI companion to see interactions here.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
=======
import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("routine");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("https://mental-health-r9h9.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded-md mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
          </div>
          <div className="mt-8">
            <div className="h-6 w-1/4 bg-gray-200 rounded-md mb-4"></div>
            <div className="space-y-3">
              <div className="h-24 w-full bg-gray-200 rounded-md"></div>
              <div className="h-24 w-full bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Calculate average distress score
  const avgDistressScore = profile.interactions.length
    ? (
        profile.interactions.reduce((sum, int) => sum + int.distressScore, 0) /
        profile.interactions.length
      ).toFixed(1)
    : "N/A";

  // Get distress level text
  const getDistressLevel = score => {
    if (score < 3) return "Low";
    if (score < 7) return "Moderate";
    return "High";
  };

  // Get distress level color
  const getDistressColor = score => {
    if (score < 3) return "bg-green-100 text-green-800";
    if (score < 7) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md border-none">
        <div className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-600">Your Profile</h2>
            <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-200">
              {profile.interactions.length} Interactions
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
                <div className="relative h-24 w-24 mb-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {profile.name.charAt(0)}
                </div>
                <h3 className="text-xl font-medium">{profile.name}</h3>
                <p className="text-gray-500">{profile.email}</p>

                <div className="w-full mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
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
                        ></path>
                      </svg>
                      Age
                    </span>
                    <span className="font-medium">{profile.age || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
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
                        ></path>
                      </svg>
                      Gender
                    </span>
                    <span className="font-medium">{profile.gender || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
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
                      Avg. Distress
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                        avgDistressScore
                      )}`}
                    >
                      {avgDistressScore} - {getDistressLevel(avgDistressScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="w-full">
                <div className="w-full grid grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
                  <button
                    className={`py-2 text-center font-medium ${
                      activeTab === "routine"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab("routine")}
                  >
                    Daily Routine
                  </button>
                  <button
                    className={`py-2 text-center font-medium ${
                      activeTab === "interactions"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab("interactions")}
                  >
                    Recent Interactions
                  </button>
                </div>

                <div className="mt-4">
                  {activeTab === "routine" && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <svg
                          className="h-5 w-5 mr-2 text-blue-600"
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
                        Your Daily Routine
                      </h3>
                      {profile.dailyRoutine ? (
                        <p className="text-gray-600 whitespace-pre-line">{profile.dailyRoutine}</p>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">You haven't set a daily routine yet.</p>
                          <p className="text-sm mt-2">
                            Adding your routine helps us provide better recommendations.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "interactions" && (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {profile.interactions.length > 0 ? (
                        profile.interactions
                          .slice(-5)
                          .reverse()
                          .map((interaction, index) => (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Conversation</h4>
                                <div className="flex items-center text-xs text-gray-500">
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
                                </div>
                              </div>

                              <div className="mb-2 pb-2 border-b border-blue-100">
                                <p className="text-sm text-gray-500 mb-1">You said:</p>
                                <p>{interaction.textInput || interaction.voiceInput}</p>
                              </div>

                              <div className="mb-2">
                                <p className="text-sm text-gray-500 mb-1">AI suggested:</p>
                                <p>{interaction.suggestedAction}</p>
                              </div>

                              <div className="flex justify-end">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                                    interaction.distressScore
                                  )}`}
                                >
                                  Distress: {interaction.distressScore}
                                </span>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-10">
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
                          <p className="text-gray-500">No interactions yet.</p>
                          <p className="text-sm mt-2">
                            Start a conversation with your AI companion to see interactions here.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
>>>>>>> ce9381768a87d83fb9fb987c4c89e5ce669f135c
