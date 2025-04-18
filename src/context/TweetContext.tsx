import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Tweet, User } from "../types";
import { useAuth } from "./AuthContext";

interface TweetContextType {
  tweets: Tweet[];
  isLoading: boolean;
  postTweet: (content: string) => Promise<boolean>;
  likeTweet: (tweetId: string) => void;
  retweetTweet: (tweetId: string) => void;
  bookmarkTweet: (tweetId: string) => void;
  deleteTweet: (tweetId: string) => Promise<boolean>;
  bookmarks: Tweet[];
}

const TweetContext = createContext<TweetContextType | undefined>(undefined);

// Sample initial tweets
const INITIAL_TWEETS: Tweet[] = [
  {
    id: "1",
    content:
      "Just deployed my new portfolio website! Check it out 🚀 #webdev #coding",
    author: {
      id: "1",
      name: "Nitin Govardhane",
      username: "nitingovardhane",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Coder&backgroundColor=b6e3f4",
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
      name: "Jitesh Borse",
      username: "jiteshborse",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Male&backgroundColor=d1d4f9",
      following: 568,
      followers: 1204,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 128,
    retweets: 34,
    replies: 22,
  },
  {
    id: "3",
    content:
      'Just finished reading "Clean Code" by Robert C. Martin. Highly recommended for all developers! 📚 #programming #softwareengineering',
    author: {
      id: "3",
      name: "Shruti",
      username: "shruti",
      avatar:
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Female&backgroundColor=ffdfbf",
      following: 423,
      followers: 987,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: 89,
    retweets: 17,
    replies: 5,
  },
];

export const TweetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [bookmarks, setBookmarks] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load tweets from localStorage or use initial tweets
    const storedTweets = localStorage.getItem("tweets");
    const storedBookmarks = localStorage.getItem("bookmarks");

    setTweets(storedTweets ? JSON.parse(storedTweets) : INITIAL_TWEETS);
    setBookmarks(storedBookmarks ? JSON.parse(storedBookmarks) : []);
    setIsLoading(false);
  }, []);

  // Update localStorage when tweets or bookmarks change
  useEffect(() => {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  }, [tweets]);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const postTweet = async (content: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTweet: Tweet = {
        id: Date.now().toString(),
        content,
        author: currentUser,
        createdAt: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        replies: 0,
      };

      setTweets((prevTweets) => [newTweet, ...prevTweets]);
      return true;
    } catch (error) {
      console.error("Error posting tweet:", error);
      return false;
    }
  };

  const likeTweet = (tweetId: string) => {
    setTweets((prevTweets) =>
      prevTweets.map((tweet) => {
        if (tweet.id === tweetId) {
          const isLiked = tweet.isLiked || false;
          return {
            ...tweet,
            likes: isLiked ? tweet.likes - 1 : tweet.likes + 1,
            isLiked: !isLiked,
          };
        }
        return tweet;
      })
    );
  };

  const retweetTweet = (tweetId: string) => {
    setTweets((prevTweets) =>
      prevTweets.map((tweet) => {
        if (tweet.id === tweetId) {
          const isRetweeted = tweet.isRetweeted || false;
          return {
            ...tweet,
            retweets: isRetweeted ? tweet.retweets - 1 : tweet.retweets + 1,
            isRetweeted: !isRetweeted,
          };
        }
        return tweet;
      })
    );
  };

  const bookmarkTweet = (tweetId: string) => {
    // Find the tweet
    const tweet = tweets.find((t) => t.id === tweetId);
    if (!tweet) return;

    // Check if it's already bookmarked
    const isBookmarked = bookmarks.some((b) => b.id === tweetId);

    if (isBookmarked) {
      // Remove from bookmarks
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((b) => b.id !== tweetId)
      );
    } else {
      // Add to bookmarks
      setBookmarks((prevBookmarks) => [...prevBookmarks, tweet]);
    }
  };

  const deleteTweet = async (tweetId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if tweet exists and belongs to current user
      const tweet = tweets.find((t) => t.id === tweetId);
      if (!tweet) return false;
      if (tweet.author.id !== currentUser.id) return false;

      // Remove the tweet from state
      setTweets((prevTweets) => prevTweets.filter((t) => t.id !== tweetId));

      // Also remove from bookmarks if it exists there
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((b) => b.id !== tweetId)
      );

      return true;
    } catch (error) {
      console.error("Error deleting tweet:", error);
      return false;
    }
  };

  const value = {
    tweets,
    isLoading,
    postTweet,
    likeTweet,
    retweetTweet,
    bookmarkTweet,
    deleteTweet,
    bookmarks,
  };

  return (
    <TweetContext.Provider value={value}>{children}</TweetContext.Provider>
  );
};

export const useTweets = (): TweetContextType => {
  const context = useContext(TweetContext);
  if (context === undefined) {
    throw new Error("useTweets must be used within a TweetProvider");
  }
  return context;
};
