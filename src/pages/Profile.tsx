import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Link as LinkIcon,
  MapPin,
  PencilLine,
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";
import { useParams } from "react-router-dom";
import TweetCard from "../components/TweetCard";
import { useAuth } from "../context/AuthContext";
import { useTweets } from "../context/TweetContext";
import ProfileEditModal from "../components/ProfileEditModal";
import FollowersModal from "../components/FollowersModal";
import axios from "axios";
import { User } from "../types";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { tweets } = useTweets();
  const [activeTab, setActiveTab] = useState("tweets");
  const [tweetDeleted, setTweetDeleted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [modalType, setModalType] = useState<"followers" | "following">(
    "followers"
  );
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // If username is provided, fetch that user's profile, otherwise use currentUser
        if (username && username !== currentUser?.username) {
          const response = await axios.get(`/api/users/username/${username}`);
          setProfileData(response.data);
          setFollowing(response.data.isFollowing || false);
          setFollowersCount(response.data.followers);
          setFollowingCount(response.data.following);
        } else {
          setProfileData(currentUser);
          setFollowersCount(currentUser?.followers || 0);
          setFollowingCount(currentUser?.following || 0);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [username, currentUser]);

  // Reset the tweetDeleted state after a short delay
  useEffect(() => {
    if (tweetDeleted) {
      const timer = setTimeout(() => {
        setTweetDeleted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tweetDeleted]);

  // Filter tweets by profile user
  const userTweets = tweets.filter(
    (tweet) => tweet.author.id === profileData?.id
  );

  // Filter tweets that are liked by the user
  const likedTweets = tweets.filter((tweet) => tweet.isLiked);

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    if (!currentUser || !profileData) return;

    try {
      if (following) {
        // Unfollow
        await axios.post(`/api/users/unfollow/${profileData.id}`, {
          userId: currentUser.id,
        });
        setFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        // Follow
        await axios.post(`/api/users/follow/${profileData.id}`, {
          userId: currentUser.id,
        });
        setFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // Fetch followers or following list
  const fetchFollowList = async (type: "followers" | "following") => {
    if (!profileData) return;

    try {
      setLoading(true);
      const url = `/api/users/${profileData.id}/${type}`;
      const response = await axios.get(url);

      if (type === "followers") {
        setFollowersList(response.data);
      } else {
        setFollowingList(response.data);
      }

      setModalType(type);
      if (type === "followers") {
        setIsFollowersModalOpen(true);
      } else {
        setIsFollowingModalOpen(true);
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const renderTweets = () => {
    switch (activeTab) {
      case "tweets":
        return userTweets.length > 0 ? (
          userTweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onDelete={() => setTweetDeleted(true)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't posted any tweets yet.
          </div>
        );
      case "replies":
        return (
          <div className="p-8 text-center text-gray-500">No replies yet.</div>
        );
      case "media":
        return (
          <div className="p-8 text-center text-gray-500">
            No media tweets yet.
          </div>
        );
      case "likes":
        return likedTweets.length > 0 ? (
          likedTweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onDelete={() => setTweetDeleted(true)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't liked any tweets yet.
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen ml-64">
        <div className="max-w-2xl border-x border-gray-700 p-4">
          <p className="text-center">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profileData) {
    return (
      <main className="min-h-screen ml-64">
        <div className="max-w-2xl border-x border-gray-700 p-4">
          <p className="text-center text-red-500">
            {error || "Profile not found"}
          </p>
        </div>
      </main>
    );
  }

  const isOwnProfile = !username || username === currentUser?.username;

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700">
          <div className="p-4">
            <h1 className="text-xl font-bold">{profileData.name}</h1>
            <p className="text-gray-500 text-sm">{userTweets.length} Tweets</p>
          </div>
        </header>

        <div
          className={`h-48 ${
            profileData.banner
              ? `bg-cover bg-center bg-no-repeat`
              : "bg-gray-800"
          }`}
          style={
            profileData.banner
              ? { backgroundImage: `url(${profileData.banner})` }
              : {}
          }
        >
          {/* Banner displays here */}
        </div>

        <div className="p-4">
          <div className="relative">
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="absolute -top-16 w-32 h-32 rounded-full border-4 border-black"
            />
            <div className="ml-36 flex justify-end">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 border border-gray-700 rounded-full font-bold hover:bg-gray-900 flex items-center gap-2"
                >
                  <PencilLine className="w-4 h-4" />
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
                    following
                      ? "bg-transparent border border-gray-500 text-white hover:border-red-500 hover:text-red-500"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {following ? (
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
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">{profileData.name}</h2>
            <p className="text-gray-500">@{profileData.username}</p>

            {profileData.bio && (
              <p className="mt-4 text-white">{profileData.bio}</p>
            )}

            <div className="mt-4 space-y-2">
              {profileData.location && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-5 h-5" />
                  <span>{profileData.location}</span>
                </div>
              )}

              {profileData.website && (
                <div className="flex items-center gap-2 text-gray-500">
                  <LinkIcon className="w-5 h-5" />
                  <a
                    href={profileData.website}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profileData.website}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-500">
                <CalendarDays className="w-5 h-5" />
                <span>
                  Joined{" "}
                  {new Date(
                    profileData.joinDate || Date.now()
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                className="hover:underline"
                onClick={() => fetchFollowList("following")}
              >
                <span className="font-bold">{followingCount}</span>{" "}
                <span className="text-gray-500">Following</span>
              </button>
              <button
                className="hover:underline"
                onClick={() => fetchFollowList("followers")}
              >
                <span className="font-bold">{followersCount}</span>{" "}
                <span className="text-gray-500">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {tweetDeleted && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 p-3 mx-4 my-2 rounded-lg text-center">
            Tweet was deleted successfully
          </div>
        )}

        <div className="border-t border-gray-700">
          <nav className="flex">
            <button
              className={`flex-1 py-4 text-center ${
                activeTab === "tweets"
                  ? "font-bold border-b-2 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
              onClick={() => setActiveTab("tweets")}
            >
              Tweets
            </button>
            <button
              className={`flex-1 py-4 text-center ${
                activeTab === "replies"
                  ? "font-bold border-b-2 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
              onClick={() => setActiveTab("replies")}
            >
              Replies
            </button>
            <button
              className={`flex-1 py-4 text-center ${
                activeTab === "media"
                  ? "font-bold border-b-2 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
              onClick={() => setActiveTab("media")}
            >
              Media
            </button>
            <button
              className={`flex-1 py-4 text-center ${
                activeTab === "likes"
                  ? "font-bold border-b-2 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
              onClick={() => setActiveTab("likes")}
            >
              Likes
            </button>
          </nav>
        </div>

        <div className="divide-y divide-gray-700">{renderTweets()}</div>
      </div>

      {/* Profile Edit Modal */}
      {isOwnProfile && currentUser && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={currentUser}
        />
      )}

      {/* Followers Modal */}
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={followersList}
        title="Followers"
        currentUser={currentUser}
      />

      {/* Following Modal */}
      <FollowersModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={followingList}
        title="Following"
        currentUser={currentUser}
      />
    </main>
  );
};

export default Profile;
