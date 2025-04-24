import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing?: boolean;
}

const UsersList: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/users?userId=${currentUser.id}`);
      // Only show 3 users in the sidebar
      setUsers(response.data.slice(0, 3));
      console.log("Fetched users:", response.data); // Debug log
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("UsersList mounted, current user:", currentUser); // Debug log
    fetchUsers();
  }, [currentUser]);

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      await axios.post(`/api/users/follow/${userId}`, {
        userId: currentUser.id,
      });

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      await axios.post(`/api/users/unfollow/${userId}`, {
        userId: currentUser.id,
      });

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isFollowing: false } : user
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border-t border-gray-800">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="rounded-full bg-gray-700 h-10 w-10"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 border-t border-gray-800">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <p className="text-gray-500 text-sm">No users found to follow.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-800">
      <h2 className="text-xl font-bold mb-4">Who to follow</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center">
            <img
              src={
                user.avatar ||
                "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
              }
              alt={user.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <Link
                to={`/profile/${user.username}`}
                className="hover:underline"
              >
                <h3 className="font-bold text-sm truncate">{user.name}</h3>
              </Link>
              <p className="text-gray-500 text-xs truncate">@{user.username}</p>
            </div>
            {!user.isFollowing ? (
              <button
                onClick={() => handleFollow(user.id)}
                className="ml-2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full hover:bg-gray-200"
              >
                Follow
              </button>
            ) : (
              <button
                onClick={() => handleUnfollow(user.id)}
                className="ml-2 border border-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full hover:border-red-500 hover:text-red-500"
              >
                Following
              </button>
            )}
          </div>
        ))}
        <Link
          to="/discover"
          className="text-blue-500 text-sm hover:underline block"
        >
          Show more
        </Link>
      </div>
    </div>
  );
};

export default UsersList;
