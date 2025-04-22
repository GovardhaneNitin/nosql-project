import React, { useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  MoreHorizontal,
  Trash2,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tweet } from "../types";
import type { Comment } from "../types";
import { formatDistanceToNow } from "date-fns";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";
import CommentBox from "./CommentBox";
import CommentCard from "./CommentCard";

interface TweetCardProps {
  tweet: Tweet;
  onDelete?: () => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onDelete }) => {
  const {
    likeTweet,
    retweetTweet,
    bookmarkTweet,
    deleteTweet,
    bookmarks,
    getComments,
    addComment,
  } = useTweets();
  const { currentUser } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBookmarked = bookmarks.some((b) => b.id === tweet.id);
  const isOwnTweet = currentUser?.id === tweet.author.id;

  // Function to handle comment section toggle
  const toggleComments = useCallback(async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);

    if (comments.length === 0) {
      setLoadingComments(true);
      setError(null);

      try {
        const fetchedComments = (await getComments(
          tweet.id
        )) as unknown as Comment[];
        if (fetchedComments) {
          setComments(fetchedComments);
        } else {
          setError("Could not load comments");
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
        setError("Failed to load comments. Please try again.");
      } finally {
        setLoadingComments(false);
      }
    }
  }, [showComments, comments.length, getComments, tweet.id]);

  // Function to handle comment button click
  const handleCommentClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowCommentBox(!showCommentBox);

      if (!showComments) {
        toggleComments();
      }
    },
    [showCommentBox, showComments, toggleComments]
  );

  // Handle new comment added
  const handleCommentAdded = useCallback(async () => {
    setLoadingComments(true);
    setError(null);

    try {
      const updatedComments = (await getComments(
        tweet.id
      )) as unknown as Comment[];
      if (updatedComments) {
        setComments(updatedComments);
      } else {
        setError("Could not refresh comments");
      }
    } catch (error) {
      console.error("Failed to refresh comments:", error);
      setError("Failed to refresh comments. Please try again.");
    } finally {
      setLoadingComments(false);
    }
  }, [getComments, tweet.id]);

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

          {/* Display images if present */}
          {tweet.images && tweet.images.length > 0 && (
            <div
              className={`mt-3 grid ${
                tweet.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              } gap-2 rounded-xl overflow-hidden`}
            >
              {tweet.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`
                    ${tweet.images?.length === 1 ? "h-80" : "h-48"} 
                    ${
                      tweet.images?.length === 3 && idx === 0
                        ? "col-span-2"
                        : ""
                    }
                  `}
                >
                  <img
                    src={img}
                    alt="Tweet media"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Display location if present */}
          {tweet.location && (
            <div className="mt-2 flex items-center text-blue-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{tweet.location}</span>
            </div>
          )}

          <div className="flex justify-between mt-4 max-w-md">
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors group"
            >
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

          {/* Comment box */}
          {showCommentBox && (
            <div className="mt-4 border-t border-gray-700 pt-3">
              <CommentBox
                tweetId={tweet.id}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          )}

          {/* Toggle comments button */}
          {tweet.replies > 0 && (
            <button
              onClick={toggleComments}
              className="mt-2 flex items-center gap-1 text-gray-500 hover:text-blue-400 text-sm"
            >
              {showComments ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide comments</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>
                    Show {tweet.replies}{" "}
                    {tweet.replies === 1 ? "comment" : "comments"}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 border-t border-gray-700 pt-2">
              {loadingComments ? (
                <div className="py-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2">Loading comments...</p>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-500">
                  <p>{error}</p>
                  <button
                    onClick={() => handleCommentAdded()}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Try again
                  </button>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      tweetId={tweet.id}
                      onCommentDeleted={handleCommentAdded}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
