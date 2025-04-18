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
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed h-screen w-64 border-r border-gray-700 p-4 flex flex-col">
      <Link
        to="/"
        className="flex items-center gap-2 p-3 rounded-full hover:bg-gray-800 w-fit"
      >
        <Hexagon className="w-8 h-8 text-purple-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Social MIT
        </span>
      </Link>

      <nav className="mt-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-full hover:bg-gray-800 transition-colors ${
                isActive ? "font-bold" : ""
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xl">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 rounded-full hover:bg-gray-800 transition-colors text-red-500 w-full text-left mt-4"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xl">Logout</span>
        </button>
      </nav>

      {currentUser && (
        <div className="mt-auto p-3 rounded-full hover:bg-gray-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{currentUser.name}</p>
              <p className="text-gray-500 truncate">@{currentUser.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
