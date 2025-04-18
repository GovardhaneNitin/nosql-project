import React, { useState } from "react";
import { Search } from "lucide-react";
import TweetCard from "../components/TweetCard";
import TrendingTopic from "../components/TrendingTopic";
import { Tweet } from "../types";

const MOCK_TRENDS = [
  { topic: "Technology", tweetCount: "125K" },
  { topic: "Programming", tweetCount: "89K" },
  { topic: "React", tweetCount: "45K" },
  { topic: "JavaScript", tweetCount: "32K" },
  { topic: "OpenSource", tweetCount: "28K" },
];

const MOCK_TWEETS: Tweet[] = [
  {
    id: "1",
    content:
      "Exciting news! Just launched our new AI-powered feature 🚀 #TechNews",
    author: {
      id: "1",
      name: "Nitin Govardhane",
      username: "nitingovardhane",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Coder&backgroundColor=b6e3f4",
      following: 542,
      followers: 12891,
    },
    createdAt: new Date().toISOString(),
    likes: 1242,
    retweets: 312,
    replies: 89,
  },
  {
    id: "2",
    content:
      "The future of web development is here! Check out these amazing new tools 🛠️ #WebDev",
    author: {
      id: "2",
      name: "Jitesh Borse",
      username: "jiteshborse",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Male&backgroundColor=d1d4f9",
      following: 234,
      followers: 5678,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 856,
    retweets: 245,
    replies: 67,
  },
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Twitter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Trending Topics</h2>
            {MOCK_TRENDS.map((trend, index) => (
              <TrendingTopic key={index} {...trend} />
            ))}
          </div>

          <div>
            <h2 className="text-xl font-bold p-4">Latest Tweets</h2>
            {MOCK_TWEETS.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Explore;
