from flask import Blueprint, request, jsonify
from config import mongo
from bson.objectid import ObjectId
import traceback
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

tweet_routes = Blueprint("tweet_routes", __name__)

@tweet_routes.route("/", methods=["GET"])
def get_tweets():
    try:
        # Verify MongoDB connection first
        if not mongo.db:
            logger.error("MongoDB connection not established")
            return jsonify({"error": "Database connection error"}), 500
            
        tweets = list(mongo.db.tweets.find().sort("createdAt", -1))
        logger.info(f"Found {len(tweets)} tweets in the database")
        return jsonify([{
            "id": str(tweet["_id"]),
            "content": tweet["content"],
            "authorId": tweet["authorId"],
            "createdAt": tweet["createdAt"],
            "likes": tweet.get("likes", 0),
            "retweets": tweet.get("retweets", 0),
            "replies": tweet.get("replies", 0),
            "images": tweet.get("images", []),
            "location": tweet.get("location", ""),
            "scheduledDate": tweet.get("scheduledDate", ""),
        } for tweet in tweets])
    except Exception as e:
        logger.error(f"Error getting tweets: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@tweet_routes.route("/", methods=["POST"])
def create_tweet():
    try:
        # Verify MongoDB connection first
        if not mongo.db:
            logger.error("MongoDB connection not established")
            return jsonify({"error": "Database connection error"}), 500
            
        data = request.json
        logger.info(f"Received tweet data: {data}")
        
        user_id = data.get("authorId")
        if not user_id:
            logger.error("Missing authorId in request")
            return jsonify({"error": "Author ID is required"}), 400

        # Check if it's a scheduled tweet
        scheduled = data.get("scheduledDate", "") != ""
        
        # Create the tweet document
        tweet = {
            "content": data["content"],
            "authorId": user_id,
            "createdAt": data["createdAt"],
            "likes": 0,
            "retweets": 0,
            "replies": 0,
            "images": data.get("images", []),
            "location": data.get("location", ""),
            "scheduledDate": data.get("scheduledDate", ""),
            "scheduled": scheduled
        }
        
        logger.info(f"Attempting to insert tweet: {tweet}")
        result = mongo.db.tweets.insert_one(tweet)
        tweet_id = str(result.inserted_id)
        logger.info(f"Created tweet with ID: {tweet_id}")

        # Add tweet ID to the user's tweets list
        try:
            # First try to find the user by string ID
            user = mongo.db.users.find_one({"_id": user_id})
            
            # If not found and the user_id is a valid ObjectId string, try with ObjectId
            if not user and isinstance(user_id, str) and len(user_id) == 24:
                try:
                    user_obj_id = ObjectId(user_id)
                    user = mongo.db.users.find_one({"_id": user_obj_id})
                    
                    if user:
                        update_result = mongo.db.users.update_one(
                            {"_id": user_obj_id},
                            {"$push": {"tweets": tweet_id}}
                        )
                        logger.info(f"Updated user with ObjectId {user_obj_id}: modified={update_result.modified_count}")
                except Exception as oid_err:
                    logger.warning(f"Could not convert to ObjectId: {user_id}. Error: {str(oid_err)}")
            elif user:
                update_result = mongo.db.users.update_one(
                    {"_id": user_id},
                    {"$push": {"tweets": tweet_id}}
                )
                logger.info(f"Updated user with string ID {user_id}: modified={update_result.modified_count}")
            else:
                logger.warning(f"No user found with ID {user_id}")
                
        except Exception as user_error:
            logger.error(f"Error updating user tweets: {str(user_error)}")
            traceback.print_exc()
            # Continue even if user update fails - the tweet is already saved

        return jsonify({
            "message": "Tweet created successfully", 
            "tweetId": tweet_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating tweet: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@tweet_routes.route("/<tweet_id>/comments", methods=["POST"])
def add_comment(tweet_id):
    try:
        data = request.json
        user_id = data.get("authorId")
        content = data.get("content")
        
        if not user_id or not content:
            return jsonify({"error": "Author ID and content are required"}), 400
            
        # Create comment object
        comment = {
            "content": content,
            "authorId": user_id,
            "tweetId": tweet_id,
            "createdAt": data.get("createdAt", datetime.now().isoformat()),
            "likes": 0
        }
        
        # Insert the comment
        result = mongo.db.comments.insert_one(comment)
        comment_id = str(result.inserted_id)
        
        # Update the tweet's reply count
        mongo.db.tweets.update_one(
            {"_id": ObjectId(tweet_id)},
            {"$inc": {"replies": 1}}
        )
        
        return jsonify({
            "message": "Comment added successfully", 
            "commentId": comment_id
        }), 201
    except Exception as e:
        logger.error(f"Error adding comment: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@tweet_routes.route("/<tweet_id>/comments", methods=["GET"])
def get_comments(tweet_id):
    try:
        # Fetch comments for the tweet
        comments = list(mongo.db.comments.find({"tweetId": tweet_id}).sort("createdAt", 1))
        
        # Format the comments for response
        formatted_comments = []
        for comment in comments:
            try:
                # Get author info
                try:
                    author_id = comment["authorId"]
                    try:
                        author_obj_id = ObjectId(author_id)
                        author = mongo.db.users.find_one({"_id": author_obj_id})
                    except:
                        author = mongo.db.users.find_one({"_id": author_id})
                    
                    if not author:
                        # Use placeholder author if not found
                        author = {
                            "_id": comment["authorId"],
                            "name": "Unknown User",
                            "username": "unknown",
                            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=Unknown"
                        }
                        
                    # Format the comment
                    formatted_comment = {
                        "id": str(comment["_id"]),
                        "content": comment["content"],
                        "createdAt": comment["createdAt"],
                        "likes": comment.get("likes", 0),
                        "author": {
                            "id": str(author["_id"]),
                            "name": author["name"],
                            "username": author["username"],
                            "avatar": author.get("avatar", "https://api.dicebear.com/7.x/adventurer/svg?seed=Default"),
                        }
                    }
                    formatted_comments.append(formatted_comment)
                except Exception as author_err:
                    logger.error(f"Error processing author for comment: {str(author_err)}")
                    traceback.print_exc()
            except Exception as comment_err:
                logger.error(f"Error processing comment: {str(comment_err)}")
                continue
                
        return jsonify(formatted_comments)
    except Exception as e:
        logger.error(f"Error getting comments: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@tweet_routes.route("/comments/<comment_id>", methods=["DELETE"])
def delete_comment(comment_id):
    try:
        # Find the comment first
        comment = mongo.db.comments.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            return jsonify({"error": "Comment not found"}), 404
            
        # Get the user ID from the request
        data = request.json
        user_id = data.get("userId")
        
        # Verify the user is the author of the comment or has admin permissions
        if not user_id or comment["authorId"] != user_id:
            # In a real app, you might check for admin privileges here
            return jsonify({"error": "Unauthorized"}), 403
            
        # Delete the comment
        mongo.db.comments.delete_one({"_id": ObjectId(comment_id)})
        
        # Decrement the tweet's reply count
        tweet_id = comment["tweetId"]
        mongo.db.tweets.update_one(
            {"_id": ObjectId(tweet_id)},
            {"$inc": {"replies": -1}}
        )
        
        return jsonify({"message": "Comment deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting comment: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
