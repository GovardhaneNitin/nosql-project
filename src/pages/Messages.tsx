import React, { useState } from "react";
import { Search, Edit } from "lucide-react";

const MOCK_CONVERSATIONS = [
  {
    id: "1",
    user: {
      name: "Shruti",
      username: "shruti",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Female&backgroundColor=ffdfbf",
    },
    lastMessage: "Thanks for the follow! Looking forward to your tweets.",
    timestamp: "2h",
  },
  {
    id: "2",
    user: {
      name: "Jitesh Borse",
      username: "jiteshborse",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Male&backgroundColor=d1d4f9",
    },
    lastMessage: "Great meeting you at the conference!",
    timestamp: "1d",
  },
];

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <button className="text-blue-400 hover:text-blue-500 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Direct Messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 rounded-full py-2 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </header>

        <div className="divide-y divide-gray-700">
          {MOCK_CONVERSATIONS.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer"
            >
              <img
                src={conversation.user.avatar}
                alt={conversation.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold truncate">
                    {conversation.user.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-gray-500 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Messages;
