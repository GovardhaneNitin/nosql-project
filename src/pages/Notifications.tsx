import React from "react";
import { Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Shruti",
      username: "shruti",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Female&backgroundColor=ffdfbf",
    },
    content: "liked your tweet",
    timestamp: "2h",
  },
  {
    id: "2",
    type: "follow",
    user: {
      name: "Jitesh Borse",
      username: "jiteshborse",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Male&backgroundColor=d1d4f9",
    },
    content: "followed you",
    timestamp: "4h",
  },
  {
    id: "3",
    type: "retweet",
    user: {
      name: "Nitin Govardhane",
      username: "nitingovardhane",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Coder&backgroundColor=b6e3f4",
    },
    content: "retweeted your tweet",
    timestamp: "8h",
  },
];

const NotificationItem = ({ notification }: { notification: any }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="w-5 h-5 text-pink-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "retweet":
        return <Repeat2 className="w-5 h-5 text-green-500" />;
      case "reply":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer border-b border-gray-700">
      <div className="p-2">{getIcon()}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <img
            src={notification.user.avatar}
            alt={notification.user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <span className="font-bold hover:underline">
              {notification.user.name}
            </span>
            <span className="text-gray-500">
              {" "}
              @{notification.user.username}
            </span>
            <span className="text-gray-500"> · {notification.timestamp}</span>
          </div>
        </div>
        <p className="mt-2 text-gray-300">{notification.content}</p>
      </div>
    </div>
  );
};

const Notifications = () => {
  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700">
          <h1 className="text-xl font-bold p-4">Notifications</h1>
        </header>

        <div>
          {MOCK_NOTIFICATIONS.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Notifications;
