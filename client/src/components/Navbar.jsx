import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, Calendar, MessageSquare, User, LogOut, Activity, Brain, ChevronDown, Home, Info } from "lucide-react";

// Check if JWT token is valid and not expired
const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token has expired (exp is in seconds, Date.now() is in ms)
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    // Check auth state on mount and route change
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const adminToken = localStorage.getItem("adminToken");
            const userData = JSON.parse(localStorage.getItem("user"));
            const adminData = JSON.parse(localStorage.getItem("admin"));

            // Validate user authentication (token must exist AND be valid AND user data must exist)
            if (token && userData && isTokenValid(token)) {
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                // Clear all stale data if token is missing or expired
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
                setIsAuthenticated(false);
            }

            // Validate admin authentication (token must exist AND be valid AND admin data must exist)
            if (adminToken && adminData && isTokenValid(adminToken)) {
                setAdmin(adminData);
                setIsAdminAuthenticated(true);
            } else {
                localStorage.removeItem("admin");
                localStorage.removeItem("adminToken");
                setAdmin(null);
                setIsAdminAuthenticated(false);
            }
        };

        checkAuth();
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
    };

    const handleAdminLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        setAdmin(null);
        setIsAdminAuthenticated(false);
        navigate("/admin/login");
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                {/* Logo - redirects to dashboard if logged in, otherwise home */}
                <Link to={isAuthenticated ? "/dashboard" : isAdminAuthenticated ? "/admin/dashboard" : "/"} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
                        <Brain className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:text-blue-600 transition-colors">
                        MIND Companion
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {isAdminAuthenticated && admin ? (
                        <>
                            <NavLink to="/admin/dashboard" icon={LayoutDashboard}>Admin Dashboard</NavLink>
                            <div className="w-px h-6 bg-gray-200 mx-3" />
                            <button
                                onClick={handleAdminLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : isAuthenticated && user ? (
                        <>
                            <div className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-100 mr-2">
                                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                <NavLink to="/daily-routine" icon={Calendar}>Routine</NavLink>
                                <NavLink to="/chat" icon={MessageSquare}>Chat</NavLink>
                                <NavLink to="/therapist" icon={User}>Therapist</NavLink>
                            </div>

                            <div className="flex items-center gap-3 pl-2">
                                <Link to="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-xs text-gray-400 font-medium">Hello,</span>
                                        <span className="text-sm font-semibold text-gray-700 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Non-authenticated: Show Home and Login only */}
                            <NavLink to="/" icon={Home}>Home</NavLink>
                            <div className="w-px h-6 bg-gray-200 mx-3" />
                            <Link to="/login" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5">
                                Login
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAdminAuthenticated && admin ? (
                                <>
                                    <MobileNavLink to="/admin/dashboard" icon={LayoutDashboard} onClick={() => setIsOpen(false)}>Admin Dashboard</MobileNavLink>
                                    <button
                                        onClick={handleAdminLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <MobileNavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
                                    <MobileNavLink to="/daily-routine" icon={Calendar} onClick={() => setIsOpen(false)}>Daily Routine</MobileNavLink>
                                    <MobileNavLink to="/chat" icon={MessageSquare} onClick={() => setIsOpen(false)}>Chat w/ AI</MobileNavLink>
                                    <MobileNavLink to="/therapist" icon={User} onClick={() => setIsOpen(false)}>Therapist</MobileNavLink>
                                    <MobileNavLink to="/profile" icon={User} onClick={() => setIsOpen(false)}>Profile</MobileNavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Non-authenticated mobile: Show Home and Login only */}
                                    <MobileNavLink to="/" icon={Home} onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                                    <div className="border-t border-gray-100 my-3" />
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="w-full flex justify-center items-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors">
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const NavLink = ({ to, children, icon: Icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-white text-blue-600 shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                }`}
        >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />}
            {children}
        </Link>
    )
}

const MobileNavLink = ({ to, children, icon: Icon, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            {Icon && <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />}
            {children}
        </Link>
    )
}

export default Navbar;
