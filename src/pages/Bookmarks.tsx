import React, { useState, useEffect } from "react";
import TweetCard from "../components/TweetCard";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";

// Define the Tweet type
type Tweet = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    following: number;
    followers: number;
  };
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
};

const MOCK_BOOKMARKS: Tweet[] = [
  {
    id: "1",
    content:
      "🔥 Top 10 Web Development Trends for 2025:\n\n1. AI-Driven Development\n2. WebAssembly Evolution\n3. Edge Computing\n4. Web3 Integration\n5. Advanced PWAs\n6. Micro Frontends\n7. Serverless Architecture\n8. Real-time Everything\n9. AR/VR Web Experiences\n10. Green Web Development\n\n#WebDev #Tech",
    author: {
      id: "2",
      name: "Jitesh Borse",
      username: "jiteshborse",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Male&backgroundColor=d1d4f9",
      following: 892,
      followers: 23891,
    },
    createdAt: new Date().toISOString(),
    likes: 2891,
    retweets: 1242,
    replies: 156,
  },
  {
    id: "2",
    content:
      "💡 Quick Tip: Use CSS Grid for responsive layouts without media queries!\n\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1rem;\n}\n\n#CSS #WebDev",
    author: {
      id: "3",
      name: "Shruti",
      username: "shruti",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Female&backgroundColor=ffdfbf",
      following: 456,
      followers: 12678,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 1567,
    retweets: 892,
    replies: 234,
  },
];

const Bookmarks = () => {
  const { bookmarks } = useTweets();
  const { currentUser } = useAuth();
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

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700">
          <div className="p-4">
            <h1 className="text-xl font-bold">Bookmarks</h1>
            <p className="text-gray-500 text-sm">@{currentUser?.username}</p>
          </div>
        </header>

        {tweetDeleted && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 p-3 mx-4 my-2 rounded-lg text-center">
            Tweet was deleted successfully
          </div>
        )}

        {bookmarks.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {bookmarks.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onDelete={() => setTweetDeleted(true)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>You haven't added any Tweets to your Bookmarks yet</p>
            <p className="mt-2">When you do, they'll show up here.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Bookmarks;
