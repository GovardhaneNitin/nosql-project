import React, { useEffect, useState } from "react";
import TweetInput from "../components/TweetInput";
import TweetCard from "../components/TweetCard";
import { useTweets } from "../context/TweetContext";

const MOCK_TWEETS: Tweet[] = [
  {
    id: "1",
    content:
      "Just deployed my new portfolio website! Check it out 🚀 #webdev #coding",
    author: {
      id: "1",
      name: "Nitin Sharma",
      username: "nitinsharma",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Nitin&backgroundColor=b6e3f4",
      following: 342,
      followers: 891,
    },
    createdAt: new Date().toISOString(),
    likes: 42,
    retweets: 12,
    replies: 8,
  },
  {
    id: "2",
    content:
      "The future of AI is incredibly exciting! What do you think will be the biggest breakthrough in the next 5 years? 🤖 #AI #tech",
    author: {
      id: "2",
      name: "Jitesh Kumar",
      username: "jiteshkumar",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Jitesh&backgroundColor=d1d4f9",
      following: 568,
      followers: 1204,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 128,
    retweets: 34,
    replies: 22,
  },
];

const Home = () => {
  const { tweets, isLoading } = useTweets();
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
          <h1 className="text-xl font-bold p-4">Home</h1>
        </header>

        <TweetInput />

        {tweetDeleted && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 p-3 mx-4 my-2 rounded-lg text-center">
            Tweet was deleted successfully
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tweets.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onDelete={() => setTweetDeleted(true)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No tweets yet. Be the first to tweet!</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
