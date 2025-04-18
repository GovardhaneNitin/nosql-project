import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface TrendingTopicProps {
  topic: string;
  tweetCount: string;
}

const TrendingTopic: React.FC<TrendingTopicProps> = ({ topic, tweetCount }) => {
  return (
    <div className="py-3 px-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">Trending</p>
          <h3 className="font-bold mt-0.5">#{topic}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{tweetCount} Tweets</p>
        </div>
        <button className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-full p-2 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TrendingTopic;