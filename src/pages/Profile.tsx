import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Link as LinkIcon,
  MapPin,
  PencilLine,
} from "lucide-react";
import TweetCard from "../components/TweetCard";
import { useAuth } from "../context/AuthContext";
import { useTweets } from "../context/TweetContext";

const MOCK_USER = {
  id: "1",
  name: "Nitin Govardhane",
  username: "nitingovardhane",
  avatar:
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Coder&backgroundColor=b6e3f4",
  bio: "Software Developer | Open Source Enthusiast | Building cool stuff",
  following: 342,
  followers: 891,
  location: "Bengaluru, India",
  website: "https://nitingovardhane.dev",
  joinDate: "2021-01-01",
};

const Profile = () => {
  const { currentUser } = useAuth();
  const { tweets } = useTweets();
  const [activeTab, setActiveTab] = useState("tweets");
  const [tweetDeleted, setTweetDeleted] = useState(false);

  // Reset the tweetDeleted state after a short delay
  useEffect(() => {
    if (tweetDeleted) {
      const timer = setTimeout(() => {
        setTweetDeleted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tweetDeleted]);

  // Filter tweets by current user
  const userTweets = tweets.filter(
    (tweet) => tweet.author.id === currentUser?.id
  );

  // Filter tweets that are liked by the user
  const likedTweets = tweets.filter((tweet) => tweet.isLiked);

  // Filter tweets that are retweeted by the user
  const retweetedTweets = tweets.filter((tweet) => tweet.isRetweeted);

  // Mock data for the profile that would normally come from the API
  const profileData = {
    location: currentUser?.bio ? MOCK_USER.location : "",
    website: currentUser?.bio ? MOCK_USER.website : "",
    joinDate: MOCK_USER.joinDate,
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

  if (!currentUser) return null;

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700">
          <div className="p-4">
            <h1 className="text-xl font-bold">{currentUser.name}</h1>
            <p className="text-gray-500 text-sm">{userTweets.length} Tweets</p>
          </div>
        </header>

        <div className="h-48 bg-gray-800">
          {/* Cover photo would go here */}
        </div>

        <div className="p-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="absolute -top-16 w-32 h-32 rounded-full border-4 border-black"
            />
            <div className="ml-36 flex justify-end">
              <button className="px-4 py-2 border border-gray-700 rounded-full font-bold hover:bg-gray-900 flex items-center gap-2">
                <PencilLine className="w-4 h-4" />
                Edit profile
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">{currentUser.name}</h2>
            <p className="text-gray-500">@{currentUser.username}</p>

            {currentUser.bio && (
              <p className="mt-4 text-white">{currentUser.bio}</p>
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
                  {new Date(profileData.joinDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button className="hover:underline">
                <span className="font-bold">{currentUser.following}</span>{" "}
                <span className="text-gray-500">Following</span>
              </button>
              <button className="hover:underline">
                <span className="font-bold">{currentUser.followers}</span>{" "}
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
    </main>
  );
};

export default Profile;
