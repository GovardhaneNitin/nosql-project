import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { User } from "../types";
import { useAuth } from "../context/AuthContext";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

// Avatar categories and options
const AVATAR_OPTIONS = {
  adventurer: {
    name: "Adventurer",
    seeds: [
      "Felix",
      "Aneka",
      "Sasha",
      "Zoe",
      "Alex",
      "Jordan",
      "Casey",
      "Riley",
      "Jessie",
      "Avery",
    ],
    colors: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
    style: "adventurer",
  },
  superhero: {
    name: "Superheroes",
    seeds: [
      "Ironman",
      "Thor",
      "Hulk",
      "BlackWidow",
      "CaptainAmerica",
      "SpiderMan",
      "BlackPanther",
      "DrStrange",
      "Vision",
      "Hawkeye",
    ],
    colors: ["f0c6c6", "f2d5d5", "f4e4e4", "d5e5f2", "e5f2d5"],
    style: "bottts",
  },
  cartoon: {
    name: "Cartoons",
    seeds: [
      "Mickey",
      "Donald",
      "Tom",
      "Jerry",
      "ScoobyDoo",
      "BugsBunny",
      "DaffyDuck",
      "Popeye",
      "Garfield",
      "Snoopy",
    ],
    colors: ["ffdfbf", "f8e9d6", "f5e1cd", "ffddc1", "ffe4c8"],
    style: "lorelei",
  },
  anime: {
    name: "Anime",
    seeds: [
      "Naruto",
      "Sasuke",
      "Luffy",
      "Goku",
      "Vegeta",
      "Eren",
      "Mikasa",
      "Tanjiro",
      "Deku",
      "Hinata",
    ],
    colors: ["e0f5ff", "ffecf5", "fff7e0", "f0ffe0", "f0e0ff"],
    style: "big-smile",
  },
  animal: {
    name: "Animals",
    seeds: [
      "Lion",
      "Tiger",
      "Bear",
      "Fox",
      "Wolf",
      "Panda",
      "Koala",
      "Penguin",
      "Owl",
      "Dolphin",
    ],
    colors: ["e1f7e7", "c8e9d6", "b5e2c4", "9bd9b3", "82d0a1"],
    style: "croodles",
  },
};

// Banner options with gradients and solid colors
const BANNER_OPTIONS = {
  gradients: [
    "bg-gradient-to-r from-blue-500 to-purple-600",
    "bg-gradient-to-r from-green-400 to-blue-500",
    "bg-gradient-to-r from-purple-500 to-pink-500",
    "bg-gradient-to-r from-yellow-400 to-orange-500",
    "bg-gradient-to-r from-nexus-purple to-nexus-pink",
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    "bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500",
    "bg-gradient-to-r from-emerald-500 to-lime-600",
  ],
  solids: [
    "bg-blue-600",
    "bg-purple-600",
    "bg-green-600",
    "bg-red-600",
    "bg-yellow-500",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-gray-700",
  ],
};

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [website, setWebsite] = useState(user.website || "");
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("adventurer");
  const [banner, setBanner] = useState(user.banner || "bg-gray-800"); // Default banner if none
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const [bannerCategory, setBannerCategory] = useState("gradients");

  // Reference for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Reset form when user changes
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setUsername(user.username);
      setBio(user.bio || "");
      setLocation(user.location || "");
      setWebsite(user.website || "");
      setAvatar(user.avatar);
      setBanner(user.banner || "bg-gray-800");
    }
  }, [user, isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Set focus to close button when modal opens
      initialFocusRef.current?.focus();

      // Disable body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Listen for escape key to close modal
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      window.addEventListener("keydown", handleEscape);
      return () => {
        // Re-enable body scroll when modal closes
        document.body.style.overflow = "visible";
        window.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const updatedData = {
        name,
        username,
        bio,
        location,
        website,
        avatar,
        banner, // Include banner in profile update
      };

      const result = await updateProfile(user.id, updatedData);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError("Failed to update profile");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred while updating profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced avatar change function
  const changeAvatar = (category: string, seed: string, color: string) => {
    const style = AVATAR_OPTIONS[category as keyof typeof AVATAR_OPTIONS].style;
    setAvatar(
      `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${color}`
    );
    setShowAvatarSelector(false);
  };

  // Generate random avatar from any category
  const generateRandomAvatar = () => {
    // Get random category
    const categories = Object.keys(AVATAR_OPTIONS);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    // Get random seed and color
    const options =
      AVATAR_OPTIONS[randomCategory as keyof typeof AVATAR_OPTIONS];
    const randomSeed =
      options.seeds[Math.floor(Math.random() * options.seeds.length)];
    const randomColor =
      options.colors[Math.floor(Math.random() * options.colors.length)];

    changeAvatar(randomCategory, randomSeed, randomColor);
  };

  const AvatarSelector = () => {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar animate-scaleIn">
          <div className="sticky top-0 z-10 bg-gray-900 p-4 border-b border-gray-700 rounded-t-xl flex items-center justify-between">
            <h3 className="text-xl font-bold">Select Avatar</h3>
            <button
              onClick={() => setShowAvatarSelector(false)}
              className="p-2 rounded-full hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Category selector */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {Object.keys(AVATAR_OPTIONS).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    {
                      AVATAR_OPTIONS[category as keyof typeof AVATAR_OPTIONS]
                        .name
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Random avatar button */}
            <button
              onClick={generateRandomAvatar}
              className="w-full mb-4 py-2 bg-gradient-to-r from-nexus-purple to-nexus-pink text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Generate Random Avatar
            </button>

            {/* Avatar grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {AVATAR_OPTIONS[
                selectedCategory as keyof typeof AVATAR_OPTIONS
              ].seeds.map((seed) => (
                <div key={seed} className="space-y-4">
                  {AVATAR_OPTIONS[
                    selectedCategory as keyof typeof AVATAR_OPTIONS
                  ].colors.map((color) => (
                    <button
                      key={`${seed}-${color}`}
                      onClick={() =>
                        changeAvatar(selectedCategory, seed, color)
                      }
                      className="w-full aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/${
                          AVATAR_OPTIONS[
                            selectedCategory as keyof typeof AVATAR_OPTIONS
                          ].style
                        }/svg?seed=${seed}&backgroundColor=${color}`}
                        alt={`${seed} avatar`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Banner selector component
  const BannerSelector = () => {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar animate-scaleIn">
          <div className="sticky top-0 z-10 bg-gray-900 p-4 border-b border-gray-700 rounded-t-xl flex items-center justify-between">
            <h3 className="text-xl font-bold">Select Banner</h3>
            <button
              onClick={() => setShowBannerSelector(false)}
              className="p-2 rounded-full hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Category selector */}
            <div className="mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setBannerCategory("gradients")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    bannerCategory === "gradients"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  Gradients
                </button>
                <button
                  onClick={() => setBannerCategory("solids")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    bannerCategory === "solids"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  Solid Colors
                </button>
              </div>
            </div>

            {/* Banner grid */}
            <div className="grid grid-cols-2 gap-4">
              {BANNER_OPTIONS[
                bannerCategory as keyof typeof BANNER_OPTIONS
              ].map((bannerClass, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setBanner(bannerClass);
                    setShowBannerSelector(false);
                  }}
                  className="w-full h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className={`w-full h-full ${bannerClass}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 rounded-t-xl">
          <div className="flex items-center gap-4">
            <button
              ref={initialFocusRef}
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 id="modal-title" className="text-xl font-bold">
              Edit profile
            </h2>
          </div>

          <button
            type="submit"
            form="profile-form"
            disabled={isSubmitting}
            className="px-4 py-1 bg-white text-black rounded-full font-bold hover:bg-gray-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="m-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="m-4 bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-center">
              Profile updated successfully!
            </div>
          )}

          <form
            id="profile-form"
            onSubmit={handleSubmit}
            className="p-4 space-y-4"
          >
            <div className={`relative h-40 ${banner} rounded-lg mb-16 group`}>
              {/* Banner with edit button */}
              <button
                type="button"
                onClick={() => setShowBannerSelector(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="bg-black/60 text-white font-bold py-2 px-4 rounded-lg">
                  Change Banner
                </span>
              </button>

              <div className="absolute -bottom-16 left-4">
                <div className="relative">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-32 h-32 rounded-full border-4 border-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white font-bold">Change</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-400 mb-1 text-sm"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1 text-right">
                  {name.length}/50
                </p>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-400 mb-1 text-sm"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/\s+/g, "")
                    )
                  }
                  maxLength={15}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1 text-right">
                  {username.length}/15
                </p>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-gray-400 mb-1 text-sm"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
                <p className="text-gray-500 text-xs mt-1 text-right">
                  {bio.length}/160
                </p>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-gray-400 mb-1 text-sm"
                >
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={30}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-gray-400 mb-1 text-sm"
                >
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar and Banner selectors */}
      {showAvatarSelector && <AvatarSelector />}
      {showBannerSelector && <BannerSelector />}
    </div>
  );
};

export default ProfileEditModal;
