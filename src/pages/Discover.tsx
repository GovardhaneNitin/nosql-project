import React, { useState, useEffect } from "react";
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

const Discover: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        console.log("Fetching users with userId:", currentUser.id); // Debug
        const response = await axios.get(`/api/users?userId=${currentUser.id}`);
        console.log("API response:", response.data); // Debug
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleFollowToggle = async (
    userId: string,
    isCurrentlyFollowing: boolean
  ) => {
    if (!currentUser) return;

    try {
      const endpoint = isCurrentlyFollowing
        ? `/api/users/unfollow/${userId}`
        : `/api/users/follow/${userId}`;

      await axios.post(endpoint, { userId: currentUser.id });

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700">
          <div className="p-4">
            <h1 className="text-xl font-bold">Discover People</h1>
            <p className="text-gray-500 text-sm">Find people to follow</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found to follow.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-start space-x-4">
                <img
                  src={
                    user.avatar ||
                    "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
                  }
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{user.name}</h3>
                      <p className="text-gray-500">@{user.username}</p>
                      {user.bio && <p className="mt-1 text-sm">{user.bio}</p>}
                    </div>
                    <button
                      onClick={() =>
                        handleFollowToggle(user.id, !!user.isFollowing)
                      }
                      className={`px-4 py-1.5 rounded-full font-bold ${
                        user.isFollowing
                          ? "bg-transparent border border-gray-600 text-white hover:border-red-500 hover:text-red-500"
                          : "bg-white text-black hover:bg-gray-200"
                      } transition-colors`}
                    >
                      {user.isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Discover;
