import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, UserMinus, Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
}

const UsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch users from the API
    setIsLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setIsLoading(false);
      });
  }, []);

  const toggleFollow = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
    if (currentUser) {
      fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUser.id }),
      }).catch((err) => console.error("Error updating follow status:", err));
    } else {
      console.error("Error: currentUser is null");
    }
  };

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-800">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800 flex items-center px-4 py-3">
          <Users className="w-6 h-6 text-nexus-purple mr-2" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-nexus-purple to-nexus-pink bg-clip-text text-transparent">
            Connect with Others
          </h1>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 rounded-full border-4 border-nexus-purple border-t-transparent animate-spin"></div>
            <p className="mt-4 text-gray-400">
              Finding interesting people for you...
            </p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-nexus-purple/20 transition-all duration-300"
              >
                <div className="p-5 flex items-center">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-nexus-purple"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-bold text-lg">{user.name}</p>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                  {currentUser && user.id !== currentUser.id && (
                    <button
                      onClick={() => toggleFollow(user.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                        user.isFollowing
                          ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                          : "bg-gradient-to-r from-nexus-purple to-nexus-pink text-white hover:opacity-90"
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                  {currentUser && user.id === currentUser.id && (
                    <span className="px-4 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-medium">
                      You
                    </span>
                  )}
                </div>
                <div className="px-5 pb-5 pt-0">
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>Followers: {Math.floor(Math.random() * 2000)}</span>
                    <span>Following: {Math.floor(Math.random() * 500)}</span>
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

export default UsersPage;
