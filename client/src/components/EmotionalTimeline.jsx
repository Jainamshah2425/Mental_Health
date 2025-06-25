import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EmotionalTimeline = () => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.post(
          "https://mental-health-r9h9.onrender.com/api/chat-timeline",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Raw response from Grok API:", res.data);

        // Since res.data is already an object, no need for match or JSON.parse
        const parsedData = res.data;

        // Validate the expected structure
        if (!parsedData || !parsedData.insights || !parsedData.insights.timeline_data) {
          throw new Error("Invalid data format received from the server");
        }

        setTimelineData(parsedData);
      } catch (error) {
        console.error("Error fetching or parsing timeline:", error);
        setError("Failed to load your emotional timeline. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !timelineData) {
    return (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <p className="text-red-600">{error || "No timeline data available."}</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: timelineData.insights.timeline_data.map(day => day.date),
    datasets: [
      {
        label: "Mood Score",
        data: timelineData.insights.timeline_data.map(day => day.mood_score),
        borderColor: "rgba(37, 99, 235, 1)", // blue-600
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Your Mood Over Time" },
    },
    scales: {
      y: { min: -100, max: 100, title: { display: true, text: "Mood Score" } },
      x: { title: { display: true, text: "Date" } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Mood Insights</h2>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                d="M7 12h10m-5-9v18m-9-6h18"
              ></path>
            </svg>
          </div>
        </div>
        <p className="text-gray-700 mb-4">{timelineData.response}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Mood Trend</p>
            <p className="font-medium capitalize">{timelineData.insights.mood_trend}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Distress Level</p>
            <p className="font-medium">{timelineData.insights.distress_level}/100</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Trigger Keywords</p>
            <p className="font-medium">
              {timelineData.insights.trigger_keywords.length > 0
                ? timelineData.insights.trigger_keywords.join(", ")
                : "None detected"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Suggested Action</p>
            <p className="font-medium">{timelineData.insights.suggested_action}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md h-96 overflow-hidden relative z-0 border-t-4 border-blue-600  ">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default EmotionalTimeline;
