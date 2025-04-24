import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HiHome, HiSearch, HiUser, HiCog } from "react-icons/hi";
import UsersList from "../components/UsersList";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-gray-700 p-4 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-blue-500">T</span>witter
          </h1>
        </div>

        <nav className="mb-6">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`flex items-center p-3 rounded-lg hover:bg-gray-800 ${
                  location.pathname === "/" ? "bg-gray-800 font-bold" : ""
                }`}
              >
                <HiHome className="mr-3 text-xl" />
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/explore"
                className={`flex items-center p-3 rounded-lg hover:bg-gray-800 ${
                  location.pathname === "/explore"
                    ? "bg-gray-800 font-bold"
                    : ""
                }`}
              >
                <HiSearch className="mr-3 text-xl" />
                Explore
              </Link>
            </li>
            <li>
              <Link
                to="/discover"
                className={`flex items-center p-3 rounded-lg hover:bg-gray-800 ${
                  location.pathname === "/discover"
                    ? "bg-gray-800 font-bold"
                    : ""
                }`}
              >
                <HiUser className="mr-3 text-xl" />
                Discover People
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center p-3 rounded-lg hover:bg-gray-800 ${
                  location.pathname === "/settings"
                    ? "bg-gray-800 font-bold"
                    : ""
                }`}
              >
                <HiCog className="mr-3 text-xl" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        {/* Users to follow section */}
        {currentUser && <UsersList />}

        <div className="mt-auto">
          {currentUser && (
            <div className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition-colors">
              <img
                src={
                  currentUser.avatar ||
                  "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
                }
                alt={currentUser.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">
                  {currentUser.name}
                </h4>
                <p className="text-gray-500 text-xs truncate">
                  @{currentUser.username}
                </p>
              </div>
              <button
                onClick={logout}
                className="ml-2 text-red-500 hover:text-red-400 text-xs"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
