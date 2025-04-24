import React, { useState } from "react";
import { X, UserPlus, UserMinus, UserCheck } from "lucide-react";
import { User } from "../types";
import axios from "axios";
import { Link } from "react-router-dom";

type FollowersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  title: string;
  currentUser: User | null;
};

const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  users,
  title,
  currentUser,
}) => {
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  const handleFollowToggle = async (user: User) => {
    if (!currentUser) return;

    try {
      const isCurrentlyFollowing = user.isFollowing || followingStatus[user.id];

      if (isCurrentlyFollowing) {
        // Unfollow
        await axios.post(`/api/users/unfollow/${user.id}`, {
          userId: currentUser.id,
        });
        setFollowingStatus({ ...followingStatus, [user.id]: false });
      } else {
        // Follow
        await axios.post(`/api/users/follow/${user.id}`, {
          userId: currentUser.id,
        });
        setFollowingStatus({ ...followingStatus, [user.id]: true });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md bg-black border border-gray-700 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-gray-900"
              >
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-3"
                  onClick={onClose}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-gray-500">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {currentUser && user.id !== currentUser.id && (
                  <button
                    onClick={() => handleFollowToggle(user)}
                    className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                      user.isFollowing || followingStatus[user.id]
                        ? "bg-transparent border border-gray-500 text-white hover:border-red-500 hover:text-red-500"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {user.isFollowing || followingStatus[user.id] ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">No users to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
