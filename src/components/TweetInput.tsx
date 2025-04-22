import React, { useState, useRef } from "react";
import { Image, Smile, Calendar, MapPin, X, AlertCircle } from "lucide-react";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const TweetInput = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { postTweet } = useTweets();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("Submitting tweet:", {
        content,
        images,
        location,
        scheduledDate,
      });
      // Pass all the tweet data to the postTweet function
      const success = await postTweet(content, images, location, scheduledDate);

      if (success) {
        // Reset form fields
        setContent("");
        setImages([]);
        setLocation("");
        setScheduledDate("");
        setShowLocationInput(false);
        setShowDatePicker(false);
      } else {
        setError("Failed to post tweet. Please try again.");
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      setError("An error occurred while posting your tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload these to a server
    // For this demo, we'll use local URLs
    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: any) => {
    setContent((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  if (!currentUser) return null;

  return (
    <div className="border-b border-gray-700 p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent border-none outline-none text-xl resize-none placeholder-gray-500"
              rows={3}
              maxLength={280}
            />

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden h-48"
                  >
                    <img
                      src={img}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 p-1 rounded-full text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location Input */}
            {showLocationInput && (
              <div className="mt-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            )}

            {/* Date Picker */}
            {showDatePicker && (
              <div className="mt-2">
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Image className="w-5 h-5" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute z-10 mt-2 -translate-x-1/2">
                      <Picker
                        data={data}
                        onEmojiSelect={addEmoji}
                        theme="dark"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`text-blue-400 hover:text-blue-500 transition-colors ${
                    showDatePicker ? "text-blue-500" : ""
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className={`text-blue-400 hover:text-blue-500 transition-colors ${
                    showLocationInput ? "text-blue-500" : ""
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>

              {content.length > 0 && (
                <div className="mr-2 text-sm">
                  <span
                    className={
                      content.length > 260 ? "text-yellow-500" : "text-gray-500"
                    }
                  >
                    {280 - content.length}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-blue-500 text-white rounded-full px-6 py-2 font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Posting..." : "Tweet"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TweetInput;
