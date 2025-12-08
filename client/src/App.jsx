import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Chat from "./components/Chat";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import PatientDashboard from "./components/PatientDashboard";
import DailyRoutine from "./components/DailyRoutine";
import Activity from "./components/Activity";
import Therapist from "./components/Therapist";
import Navbar from "./components/Navbar";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/daily-routine" element={<DailyRoutine />} />
        <Route path="/activity/:activityId" element={<Activity />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/therapist" element={<Therapist />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-poppins text-gray-900">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
