import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import axios from "axios";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  updateProfile: (
    userId: string,
    profileData: Partial<User>
  ) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demonstration
const MOCK_USER: User = {
  id: "1",
  name: "Nitin Govardhane",
  username: "nitingovardhane",
  avatar:
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Coder&backgroundColor=b6e3f4",
  bio: "Software Developer | Open Source Enthusiast | Building cool stuff",
  following: 342,
  followers: 891,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in local storage on initial load
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with:", { email });
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });
      console.log("Login successful:", response.data);
      setCurrentUser(response.data);
      localStorage.setItem("currentUser", JSON.stringify(response.data));
      return true;
    } catch (error: any) {
      // Check specifically for network errors (server unreachable)
      if (error.code === "ECONNABORTED" || !error.response) {
        console.error("Cannot connect to backend server:", error);
        throw new Error(
          "Cannot connect to backend server. Please try again later."
        );
      }

      console.error("Login error:", error);
      if (error.response) {
        console.error("Login error details:", error.response.data);
      }
      throw error; // Rethrow to be caught by the component
    }
  };

  const signup = async (
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post("/api/users/signup", {
        name,
        username,
        email,
        password,
      });
      console.log("Signup successful:", response.data);

      // Try login now
      try {
        return await login(email, password);
      } catch (loginError: any) {
        console.error("Login failed after successful signup:", loginError);
        if (loginError.response) {
          console.error("Login error details:", loginError.response.data);
        }
        return false;
      }
    } catch (error: any) {
      // Check specifically for network errors (server unreachable)
      if (error.code === "ECONNABORTED" || !error.response) {
        console.error("Cannot connect to backend server:", error);
        throw new Error(
          "Cannot connect to backend server. Please try again later."
        );
      }

      console.error("Signup error:", error);
      if (error.response) {
        console.error("Signup error details:", error.response.data);
      }
      throw error; // Rethrow to be caught by the component
    }
  };

  const updateProfile = async (
    userId: string,
    profileData: Partial<User>
  ): Promise<User | null> => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Always make a real API call to update the profile
      const response = await axios.put(`/api/users/${userId}`, profileData);
      const updatedUser = response.data;

      // Update current user in state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error: any) {
      // Check specifically for network errors (server unreachable)
      if (error.code === "ECONNABORTED" || !error.response) {
        console.error("Cannot connect to backend server:", error);
        throw new Error(
          "Cannot connect to backend server. Please try again later."
        );
      }

      console.error("Error updating profile:", error);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    signup,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
