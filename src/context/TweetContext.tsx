import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Tweet, User } from "../types";
import { useAuth } from "./AuthContext";
import axios from "axios";

interface TweetContextType {
  tweets: Tweet[];
  isLoading: boolean;
  postTweet: (
    content: string,
    images?: string[],
    location?: string,
    scheduledDate?: string
  ) => Promise<boolean>;
  likeTweet: (tweetId: string) => void;
  retweetTweet: (tweetId: string) => void;
  bookmarkTweet: (tweetId: string) => void;
  deleteTweet: (tweetId: string) => Promise<boolean>;
  bookmarks: Tweet[];
  addComment: (tweetId: string, content: string) => Promise<boolean>;
  getComments: (tweetId: string) => Promise<Comment[]>;
  deleteComment: (commentId: string, tweetId: string) => Promise<boolean>;
}

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

// Create the TweetContext
const TweetContext = createContext<TweetContextType | undefined>(undefined);

export const TweetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [bookmarks, setBookmarks] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  // Add a function to fetch tweets from the backend
  const fetchTweets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/tweets");
      console.log("Fetched tweets from API:", response.data);

      // Process the tweets to include proper user objects
      const processedTweets = await Promise.all(
        response.data.map(async (tweet: any) => {
          try {
            // Get author info for each tweet
            const authorResponse = await axios.get(
              `/api/users/${tweet.authorId}`
            );
            return {
              id: tweet.id,
              content: tweet.content,
              author: authorResponse.data,
              createdAt: tweet.createdAt,
              likes: tweet.likes || 0,
              retweets: tweet.retweets || 0,
              replies: tweet.replies || 0,
              images: tweet.images || [],
              location: tweet.location || "",
              scheduledDate: tweet.scheduledDate || "",
            };
          } catch (error) {
            console.error("Error fetching author for tweet:", error);
            return null;
          }
        })
      );

      const validTweets = processedTweets.filter((tweet) => tweet !== null);
      setTweets(validTweets);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      // Fallback to local storage or initial tweets
      const storedTweets = localStorage.getItem("tweets");
      setTweets(storedTweets ? JSON.parse(storedTweets) : INITIAL_TWEETS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // On mount, try to fetch tweets
    fetchTweets();

    // Still load bookmarks from localStorage
    const storedBookmarks = localStorage.getItem("bookmarks");
    setBookmarks(storedBookmarks ? JSON.parse(storedBookmarks) : []);
  }, []);

  // Update localStorage when tweets or bookmarks change
  useEffect(() => {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  }, [tweets]);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const postTweet = async (
    content: string,
    images: string[] = [],
    location: string = "",
    scheduledDate: string = ""
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      console.log("Posting tweet with data:", {
        content,
        images,
        location,
        scheduledDate,
      });

      // Create tweet data object
      const tweetData = {
        content,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        images,
        location,
        scheduledDate,
      };

      console.log("Sending to API:", tweetData);
      console.log("User ID format:", typeof currentUser.id, currentUser.id);

      // First check if API is available
      try {
        await axios.get("/api/health");
      } catch (healthErr) {
        console.error("API health check failed:", healthErr);
        throw new Error("Backend server appears to be offline");
      }

      // Send to backend API with timeout
      const response = await axios.post("/api/tweets", tweetData, {
        timeout: 10000, // 10 second timeout
      });

      console.log("API response:", response.data);

      // Refresh tweets from server to ensure we have the latest data
      setTimeout(() => fetchTweets(), 1000);

      // Create frontend tweet object with API response
      const newTweet: Tweet = {
        id: response.data.tweetId || Date.now().toString(),
        content,
        author: currentUser,
        createdAt: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        replies: 0,
        images,
        location,
        scheduledDate,
      };

      // Update state
      setTweets((prevTweets) => [newTweet, ...prevTweets]);
      return true;
    } catch (error) {
      console.error("Error posting tweet:", error);

      // Log specific error details
      if (axios.isAxiosError(error)) {
        console.error("API Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      // Fallback to local-only mode if API fails
      if (process.env.NODE_ENV === "development") {
        console.log("Falling back to local mode for development");
        const newTweet: Tweet = {
          id: Date.now().toString(),
          content,
          author: currentUser,
          createdAt: new Date().toISOString(),
          likes: 0,
          retweets: 0,
          replies: 0,
          images,
          location,
          scheduledDate,
        };

        setTweets((prevTweets) => [newTweet, ...prevTweets]);
        return true;
      }

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

  // Add new function to post a comment
  const addComment = async (
    tweetId: string,
    content: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Create comment data object
      const commentData = {
        content,
        authorId: currentUser.id,
        tweetId,
        createdAt: new Date().toISOString(),
      };

      // Send to backend API
      const response = await axios.post(
        `/api/tweets/${tweetId}/comments`,
        commentData
      );
      console.log("Comment API response:", response.data);

      // Update the tweet's replies count in state
      setTweets((prevTweets) =>
        prevTweets.map((tweet) => {
          if (tweet.id === tweetId) {
            return {
              ...tweet,
              replies: tweet.replies + 1,
            };
          }
          return tweet;
        })
      );

      return true;
    } catch (error) {
      console.error("Error posting comment:", error);

      // Fallback for development
      if (process.env.NODE_ENV === "development") {
        // Update the tweet's replies count in state anyway
        setTweets((prevTweets) =>
          prevTweets.map((tweet) => {
            if (tweet.id === tweetId) {
              return {
                ...tweet,
                replies: tweet.replies + 1,
              };
            }
            return tweet;
          })
        );
        return true;
      }

      return false;
    }
  };

  // Add function to get comments for a tweet
  const getComments = async (tweetId: string): Promise<Comment[]> => {
    try {
      // Fetch comments from API
      const response = await axios.get(`/api/tweets/${tweetId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  // Add new function to delete a comment
  const deleteComment = async (
    commentId: string,
    tweetId: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Make API call to delete the comment
      await axios.delete(`/api/tweets/comments/${commentId}`, {
        data: { userId: currentUser.id },
      });

      // Update the tweet's replies count in state
      setTweets((prevTweets) =>
        prevTweets.map((tweet) => {
          if (tweet.id === tweetId) {
            return {
              ...tweet,
              replies: Math.max(0, tweet.replies - 1),
            };
          }
          return tweet;
        })
      );

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);

      // Fallback for development
      if (process.env.NODE_ENV === "development") {
        // Update the tweet's replies count in state anyway
        setTweets((prevTweets) =>
          prevTweets.map((tweet) => {
            if (tweet.id === tweetId) {
              return {
                ...tweet,
                replies: Math.max(0, tweet.replies - 1),
              };
            }
            return tweet;
          })
        );
        return true;
      }

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
    addComment,
    getComments,
    deleteComment,
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
