import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Bell,
  Mail,
  Bookmark,
  LogOut,
  Settings,
  Hexagon,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Mail, label: "Messages", path: "/messages" },
    { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Hexagon, label: "Users", path: "/users" }, // New "Users" category
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r border-gray-800 shadow-2xl rounded-r-3xl p-4 flex flex-col z-30">
      <Link
        to="/"
        className="flex items-center gap-2 p-3 rounded-full hover:bg-gray-800 w-fit mb-2"
      >
        <Hexagon className="w-8 h-8 text-nexus-purple drop-shadow" />
        <span className="text-xl font-bold bg-gradient-to-r from-nexus-purple to-nexus-pink bg-clip-text text-transparent">
          Social MIT
        </span>
      </Link>

      <nav className="mt-4 flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-full transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-nexus-purple to-nexus-pink text-white font-bold shadow"
                  : "hover:bg-gray-800 text-gray-200"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xl">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 rounded-full hover:bg-gray-900 transition-colors text-red-500 w-full text-left mt-4 font-bold"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xl">Logout</span>
        </button>
      </nav>

      {currentUser && (
        <div className="mt-auto p-3 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 hover:bg-gray-900 cursor-pointer shadow flex items-center gap-3 transition-all">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full border-2 border-nexus-purple"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{currentUser.name}</p>
            <p className="text-gray-400 truncate">@{currentUser.username}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
