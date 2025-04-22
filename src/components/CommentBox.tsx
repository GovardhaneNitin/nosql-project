import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface CommentBoxProps {
  tweetId: string;
  onCommentAdded: () => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({ tweetId, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting || !currentUser) return;

    setIsSubmitting(true);

    try {
      // Make API call to add comment
      const response = await fetch(`/api/tweets/${tweetId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          authorId: currentUser.id,
        }),
      });

      if (response.ok) {
        setContent("");
        onCommentAdded();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="py-3 px-4 border-b border-gray-700"
    >
      <div className="flex gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-none outline-none resize-none placeholder-gray-500"
            rows={2}
            maxLength={280}
          />

          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {content.length > 0 && `${280 - content.length} characters left`}
            </div>

            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-blue-500 text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Reply"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentBox;
