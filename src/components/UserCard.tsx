import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isFollowing?: boolean;
}

interface UserCardProps {
  user: User;
  onFollowToggle?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollowToggle }) => {
  const { currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const endpoint = isFollowing
        ? `/api/users/unfollow/${user.id}`
        : `/api/users/follow/${user.id}`;

      await axios.post(endpoint, { userId: currentUser.id });

      setIsFollowing(!isFollowing);
      if (onFollowToggle) onFollowToggle();
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition-colors">
      <img
        src={
          user.avatar ||
          "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
        }
        alt={user.name}
        className="w-10 h-10 rounded-full mr-3"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="truncate">
            <h4 className="font-bold text-sm truncate">{user.name}</h4>
            <p className="text-gray-500 text-xs truncate">@{user.username}</p>
          </div>
          {currentUser && currentUser.id !== user.id && (
            <button
              onClick={handleFollowToggle}
              disabled={isLoading}
              className={`text-xs px-3 py-1 rounded-full font-bold ${
                isFollowing
                  ? "bg-transparent border border-gray-600 text-white hover:border-red-500 hover:text-red-500"
                  : "bg-white text-black hover:bg-gray-200"
              } transition-colors`}
            >
              {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
