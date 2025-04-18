import React, { useState } from "react";
import { Image, Smile, Calendar, MapPin } from "lucide-react";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";

const TweetInput = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { postTweet } = useTweets();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await postTweet(content);
      setContent("");
    } catch (error) {
      console.error("Error posting tweet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="border-b border-gray-700 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent border-none outline-none text-xl resize-none placeholder-gray-500"
              rows={3}
              maxLength={280}
            />

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>

              {content.length > 0 && (
                <div className="mr-2 text-sm">
                  <span
                    className={
                      content.length > 260 ? "text-yellow-500" : "text-gray-500"
                    }
                  >
                    {280 - content.length}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-blue-500 text-white rounded-full px-6 py-2 font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Posting..." : "Tweet"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TweetInput;
