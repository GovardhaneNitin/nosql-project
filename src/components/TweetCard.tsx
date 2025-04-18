import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Tweet } from "../types";
import { formatDistanceToNow } from "date-fns";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";

interface TweetCardProps {
  tweet: Tweet;
  onDelete?: () => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onDelete }) => {
  const { likeTweet, retweetTweet, bookmarkTweet, deleteTweet, bookmarks } =
    useTweets();
  const { currentUser } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBookmarked = bookmarks.some((b) => b.id === tweet.id);
  const isOwnTweet = currentUser?.id === tweet.author.id;

  const handleDeleteTweet = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const success = await deleteTweet(tweet.id);
      if (success && onDelete) {
        onDelete();
      } else if (!success) {
        console.error("Failed to delete tweet");
      }
    } catch (error) {
      console.error("Error deleting tweet:", error);
    } finally {
      setIsDeleting(false);
      setShowOptions(false);
    }
  };

  return (
    <div className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
      <div className="flex gap-4">
        <img
          src={tweet.author.avatar}
          alt={tweet.author.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold hover:underline">
                {tweet.author.name}
              </span>
              <span className="text-gray-500">@{tweet.author.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(tweet.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {isOwnTweet && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <button
                        onClick={handleDeleteTweet}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-700 w-full text-left"
                        role="menuitem"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete Tweet"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-2 text-gray-100 whitespace-pre-line">
            {tweet.content}
          </p>

          <div className="flex justify-between mt-4 max-w-md">
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors group">
              <MessageCircle className="w-5 h-5 group-hover:bg-blue-400/10 rounded-full p-0.5" />
              <span>{tweet.replies}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                retweetTweet(tweet.id);
              }}
              className={`flex items-center gap-2 transition-colors group 
                ${
                  tweet.isRetweeted
                    ? "text-green-500"
                    : "text-gray-500 hover:text-green-500"
                }`}
            >
              <Repeat2 className="w-5 h-5 group-hover:bg-green-500/10 rounded-full p-0.5" />
              <span>{tweet.retweets}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                likeTweet(tweet.id);
              }}
              className={`flex items-center gap-2 transition-colors group
                ${
                  tweet.isLiked
                    ? "text-pink-500"
                    : "text-gray-500 hover:text-pink-500"
                }`}
            >
              <Heart
                className={`w-5 h-5 group-hover:bg-pink-500/10 rounded-full p-0.5 
                  ${tweet.isLiked ? "fill-pink-500" : ""}`}
              />
              <span>{tweet.likes}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                bookmarkTweet(tweet.id);
              }}
              className={`flex items-center gap-2 transition-colors
                ${
                  isBookmarked
                    ? "text-blue-400"
                    : "text-gray-500 hover:text-blue-400"
                }`}
            >
              <Bookmark
                className={`w-5 h-5 ${isBookmarked ? "fill-blue-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
