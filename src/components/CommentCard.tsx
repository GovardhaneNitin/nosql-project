import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTweets } from "../context/TweetContext";

interface CommentCardProps {
  comment: Comment;
  tweetId: string;
  onCommentDeleted?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  tweetId,
  onCommentDeleted,
}) => {
  const { currentUser } = useAuth();
  const { deleteComment } = useTweets();
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnComment = currentUser?.id === comment.author.id;

  const handleDeleteComment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const success = await deleteComment(comment.id, tweetId);
      if (success && onCommentDeleted) {
        onCommentDeleted();
      } else if (!success) {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
      setShowOptions(false);
    }
  };

  return (
    <div className="py-3 border-b border-gray-700">
      <div className="flex gap-3">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">{comment.author.name}</span>
              <span className="text-gray-500">@{comment.author.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {isOwnComment && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <button
                        onClick={handleDeleteComment}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-700 w-full text-left"
                        role="menuitem"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-1 text-gray-200">{comment.content}</p>

          <div className="flex mt-2 text-gray-500">
            <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-xs">{comment.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
