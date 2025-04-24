export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
}

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
  images?: string[];
  location?: string;
  scheduledDate?: string;
  comments?: Comment[];
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
  banner?: string;
  isFollowing?: boolean; // Added to track if current user is following this user
}

export interface Notification {
  id: string;
  type: "like" | "retweet" | "follow" | "reply";
  user: User;
  content: string;
  timestamp: string;
  tweetId?: string;
}
