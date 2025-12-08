"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      try {
        const res = await axios.get("https://mental-health-r9h9.onrender.com/api/admin/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Filter patients based on search term and active tab
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "high") {
      // Patients with high distress (avg score > 7)
      const avgScore = patient.interactions.length
        ? patient.interactions.reduce((sum, int) => sum + int.distressScore, 0) /
        patient.interactions.length
        : 0;
      return matchesSearch && avgScore > 7;
    }
    if (activeTab === "recent") {
      // Patients with interactions in the last 24 hours
      const hasRecentInteraction = patient.interactions.some(int => {
        const interactionTime = new Date(int.timestamp);
        const now = new Date();
        const hoursDiff = (now - interactionTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      });
      return matchesSearch && hasRecentInteraction;
    }
    return matchesSearch;
  });

  // Calculate average distress score
  const getAvgDistressScore = interactions => {
    if (!interactions.length) return "N/A";
    return (
      interactions.reduce((sum, int) => sum + int.distressScore, 0) / interactions.length
    ).toFixed(1);
  };

  // Get distress level color
  const getDistressColor = score => {
    if (score < 3) return "bg-green-100 text-green-800";
    if (score < 7) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 w-1/4 bg-gray-200 rounded-md mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 w-full bg-gray-200 rounded-md"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 w-full bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold">{patients.length}</p>
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Today</p>
              <p className="text-2xl font-bold">
                {
                  patients.filter(p =>
                    p.interactions.some(int => {
                      const today = new Date();
                      const interactionDate = new Date(int.timestamp);
                      return interactionDate.toDateString() === today.toDateString();
                    })
                  ).length
                }
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Distress</p>
              <p className="text-2xl font-bold">
                {
                  patients.filter(p => {
                    const avgScore = p.interactions.length
                      ? p.interactions.reduce((sum, int) => sum + int.distressScore, 0) /
                      p.interactions.length
                      : 0;
                    return avgScore > 7;
                  }).length
                }
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
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
              <p className="text-sm text-gray-500">Total Interactions</p>
              <p className="text-2xl font-bold">
                {patients.reduce((sum, p) => sum + p.interactions.length, 0)}
              </p>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border-none">
        <div className="p-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
          <h2 className="text-2xl font-semibold text-blue-600">Patient Management</h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <svg
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-8 w-full sm:w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="p-2 border border-gray-300 rounded-md">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                ></path>
              </svg>
              <span className="sr-only">Filter</span>
            </button>

            <button className="p-2 border border-gray-300 rounded-md">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                ></path>
              </svg>
              <span className="sr-only">Export</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 w-full grid grid-cols-3 bg-gray-100 rounded-lg overflow-hidden">
            <button
              className={`py-2 text-center font-medium ${activeTab === "all"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("all")}
            >
              All Patients
            </button>
            <button
              className={`py-2 text-center font-medium ${activeTab === "high"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("high")}
            >
              High Distress
            </button>
            <button
              className={`py-2 text-center font-medium ${activeTab === "recent"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("recent")}
            >
              Recent Activity
            </button>
          </div>

          {filteredPatients.length > 0 ? (
            <div className="rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Patient
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Interactions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Avg. Distress
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Last Interaction
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map(patient => {
                    const avgScore = getAvgDistressScore(patient.interactions);
                    const lastInteraction =
                      patient.interactions.length > 0
                        ? new Date(
                          patient.interactions[patient.interactions.length - 1].timestamp
                        ).toLocaleString()
                        : "None";

                    return (
                      <tr
                        key={patient._id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.interactions.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {avgScore !== "N/A" && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                                avgScore
                              )}`}
                            >
                              {avgScore}
                            </span>
                          )}
                          {avgScore === "N/A" && <span className="text-gray-500">N/A</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{lastInteraction}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <p className="text-gray-500">No patients found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="h-12 w-12 text-gray-400 opacity-20 mb-3"
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
              <h3 className="text-lg font-medium">No patients found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {selectedPatient && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                </div>
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                  onClick={() => setSelectedPatient(null)}
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500">Recent Interactions</h4>
                {selectedPatient.interactions
                  .slice(-3)
                  .reverse()
                  .map((interaction, idx) => (
                    <div key={idx} className="p-3 bg-gray-100 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium">
                          {interaction.textInput || interaction.voiceInput}
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getDistressColor(
                            interaction.distressScore
                          )}`}
                        >
                          Score: {interaction.distressScore}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        <strong>AI Response:</strong> {interaction.suggestedAction}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
