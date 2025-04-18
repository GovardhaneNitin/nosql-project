export interface Tweet {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  following: number;
  followers: number;
  location?: string;
  website?: string;
  joinDate?: string;
  banner?: string; // Add banner property
}

export interface Notification {
  id: string;
  type: "like" | "retweet" | "follow" | "reply";
  user: User;
  content: string;
  timestamp: string;
  tweetId?: string;
}
