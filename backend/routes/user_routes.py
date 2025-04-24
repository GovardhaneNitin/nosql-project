from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config import mongo
from bson.objectid import ObjectId
import traceback  # Add missing import

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/", methods=["GET"])
def get_users():
    try:
        # Enhanced to provide more info for user discovery
        current_user_id = request.args.get('userId')
        
        # Get all users
        users = list(mongo.db.users.find({}, {
            "password": 0  # Exclude password field
        }))
        
        result = []
        for user in users:
            # Skip current user if specified
            if current_user_id and str(user.get("_id")) == current_user_id:
                continue
                
            # Convert ObjectId to string
            user_id = str(user.get("_id"))
            
            # Check if current user is following this user
            is_following = False
            if current_user_id:
                # Check if current user exists in this user's followers
                is_following = current_user_id in [str(follower) for follower in user.get("followers_list", [])]
            
            result.append({
                "id": user_id,
                "name": user.get("name"),
                "username": user.get("username"),
                "bio": user.get("bio", ""),
                "avatar": user.get("avatar", ""),
                "following": user.get("following", 0),
                "followers": user.get("followers", 0),
                "isFollowing": is_following
            })
            
        return jsonify(result)
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@user_routes.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        
        # Check if required fields exist
        if not all(key in data for key in ["name", "username", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Check if email exists
        if mongo.db.users.find_one({"email": data["email"]}):
            return jsonify({"error": "Email already exists"}), 400
            
        # Check if username exists
        if mongo.db.users.find_one({"username": data["username"]}):
            return jsonify({"error": "Username already exists"}), 400

        hashed_password = generate_password_hash(data["password"])
        user = {
            "name": data["name"],
            "username": data["username"],
            "email": data["email"],
            "password": hashed_password,
            "following": 0,
            "followers": 0,
            # Add a default avatar 
            "avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={data['username']}",
            "tweets": []
        }
        result = mongo.db.users.insert_one(user)
        return jsonify({"message": "User created successfully", "userId": str(result.inserted_id)}), 201
        
    except Exception as e:
        print(f"Error during signup: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@user_routes.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        
        # Check if required fields exist
        if not all(key in data for key in ["email", "password"]):
            return jsonify({"error": "Missing email or password"}), 400
            
        # Find user
        user = mongo.db.users.find_one({"email": data["email"]})
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
            
        # Check password
        if not check_password_hash(user["password"], data["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        # Add a default avatar if none exists
        if not user.get("avatar"):
            user["avatar"] = f"https://api.dicebear.com/7.x/adventurer/svg?seed={user['username']}"

        return jsonify({
            "id": str(user["_id"]),
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar", ""),
            "bio": user.get("bio", ""),
            "following": user["following"],
            "followers": user["followers"],
            "location": user.get("location", ""),
            "website": user.get("website", ""),
            "banner": user.get("banner", ""),
        })
        
    except Exception as e:
        print(f"Error during login: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@user_routes.route("/", methods=["POST"])
def create_user():
    data = request.json
    mongo.db.users.insert_one(data)
    return jsonify({"message": "User created successfully"}), 201

@user_routes.route("/<user_id>/tweets", methods=["GET"])
def get_user_tweets(user_id):
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    tweet_ids = user.get("tweets", [])
    tweets = mongo.db.tweets.find({"_id": {"$in": [ObjectId(tweet_id) for tweet_id in tweet_ids]}})
    return jsonify([{
        "id": str(tweet["_id"]),
        "content": tweet["content"],
        "authorId": tweet["authorId"],
        "createdAt": tweet["createdAt"]
    } for tweet in tweets])

@user_routes.route("/<user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update fields
    update_data = {}
    if "name" in data:
        update_data["name"] = data["name"]
    if "username" in data and data["username"] != user["username"]:
        # Check if username already exists
        if mongo.db.users.find_one({"username": data["username"], "_id": {"$ne": ObjectId(user_id)}}):
            return jsonify({"error": "Username already exists"}), 400
        update_data["username"] = data["username"]
    if "bio" in data:
        update_data["bio"] = data["bio"]
    if "avatar" in data:
        update_data["avatar"] = data["avatar"]
    if "banner" in data:
        update_data["banner"] = data["banner"]
    if "location" in data:
        update_data["location"] = data["location"]
    if "website" in data:
        update_data["website"] = data["website"]

    if update_data:
        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    # Get the updated user
    updated_user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    return jsonify({
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "username": updated_user["username"],
        "email": updated_user["email"],
        "avatar": updated_user.get("avatar", ""),
        "bio": updated_user.get("bio", ""),
        "banner": updated_user.get("banner", ""),
        "location": updated_user.get("location", ""),
        "website": updated_user.get("website", ""),
        "following": updated_user["following"],
        "followers": updated_user["followers"],
    })

@user_routes.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    try:
        # Handle case where user ID might not be a valid ObjectId
        try:
            user_obj_id = ObjectId(user_id)
            user = mongo.db.users.find_one({"_id": user_obj_id})
        except:
            user = mongo.db.users.find_one({"_id": user_id})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": str(user.get("_id")),
            "name": user.get("name", "Unknown User"),
            "username": user.get("username", "unknown"),
            "email": user.get("email", ""),
            "avatar": user.get("avatar", "https://api.dicebear.com/7.x/adventurer/svg?seed=Default"),
            "bio": user.get("bio", ""),
            "following": user.get("following", 0),
            "followers": user.get("followers", 0),
            "location": user.get("location", ""),
            "website": user.get("website", ""),
            "banner": user.get("banner", ""),
        })
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@user_routes.route("/follow/<target_user_id>", methods=["POST"])
def follow_user(target_user_id):
    try:
        data = request.json
        current_user_id = data.get("userId")
        
        if not current_user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        # Convert string IDs to ObjectId
        try:
            current_user_obj_id = ObjectId(current_user_id)
            target_user_obj_id = ObjectId(target_user_id)
        except:
            return jsonify({"error": "Invalid user ID format"}), 400
            
        # Check if users exist
        current_user = mongo.db.users.find_one({"_id": current_user_obj_id})
        target_user = mongo.db.users.find_one({"_id": target_user_obj_id})
        
        if not current_user or not target_user:
            return jsonify({"error": "User not found"}), 404
            
        # Check if already following
        if target_user_id in current_user.get("following_list", []):
            return jsonify({"error": "Already following this user"}), 400
            
        # Update current user's following list and count
        mongo.db.users.update_one(
            {"_id": current_user_obj_id},
            {
                "$push": {"following_list": target_user_id},
                "$inc": {"following": 1}
            }
        )
        
        # Update target user's followers list and count
        mongo.db.users.update_one(
            {"_id": target_user_obj_id},
            {
                "$push": {"followers_list": current_user_id},
                "$inc": {"followers": 1}
            }
        )
        
        return jsonify({"message": "Successfully followed user"}), 200
    except Exception as e:
        print(f"Error following user: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@user_routes.route("/unfollow/<target_user_id>", methods=["POST"])
def unfollow_user(target_user_id):
    try:
        data = request.json
        current_user_id = data.get("userId")
        
        if not current_user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        # Convert string IDs to ObjectId
        try:
            current_user_obj_id = ObjectId(current_user_id)
            target_user_obj_id = ObjectId(target_user_id)
        except:
            return jsonify({"error": "Invalid user ID format"}), 400
            
        # Check if users exist
        current_user = mongo.db.users.find_one({"_id": current_user_obj_id})
        target_user = mongo.db.users.find_one({"_id": target_user_obj_id})
        
        if not current_user or not target_user:
            return jsonify({"error": "User not found"}), 404
            
        # Check if actually following
        if target_user_id not in current_user.get("following_list", []):
            return jsonify({"error": "Not following this user"}), 400
            
        # Update current user's following list and count
        mongo.db.users.update_one(
            {"_id": current_user_obj_id},
            {
                "$pull": {"following_list": target_user_id},
                "$inc": {"following": -1}
            }
        )
        
        # Update target user's followers list and count
        mongo.db.users.update_one(
            {"_id": target_user_obj_id},
            {
                "$pull": {"followers_list": current_user_id},
                "$inc": {"followers": -1}
            }
        )
        
        return jsonify({"message": "Successfully unfollowed user"}), 200
    except Exception as e:
        print(f"Error unfollowing user: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@user_routes.route("/<user_id>/followers", methods=["GET"])
def get_user_followers(user_id):
    try:
        # Convert string ID to ObjectId
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({"error": "Invalid user ID format"}), 400
            
        # Check if user exists
        user = mongo.db.users.find_one({"_id": user_obj_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Get followers list
        followers_list = user.get("followers_list", [])
        followers = []
        
        # Get details for each follower
        for follower_id in followers_list:
            try:
                follower_obj_id = ObjectId(follower_id)
                follower = mongo.db.users.find_one({"_id": follower_obj_id})
                if follower:
                    followers.append({
                        "id": str(follower["_id"]),
                        "name": follower["name"],
                        "username": follower["username"],
                        "avatar": follower.get("avatar", ""),
                        "bio": follower.get("bio", "")
                    })
            except Exception as e:
                print(f"Error processing follower {follower_id}: {str(e)}")
                
        return jsonify(followers)
    except Exception as e:
        print(f"Error getting followers: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@user_routes.route("/<user_id>/following", methods=["GET"])
def get_user_following(user_id):
    try:
        # Convert string ID to ObjectId
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({"error": "Invalid user ID format"}), 400
            
        # Check if user exists
        user = mongo.db.users.find_one({"_id": user_obj_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Get following list
        following_list = user.get("following_list", [])
        following = []
        
        # Get details for each followed user
        for following_id in following_list:
            try:
                following_obj_id = ObjectId(following_id)
                followed_user = mongo.db.users.find_one({"_id": following_obj_id})
                if followed_user:
                    following.append({
                        "id": str(followed_user["_id"]),
                        "name": followed_user["name"],
                        "username": followed_user["username"],
                        "avatar": followed_user.get("avatar", ""),
                        "bio": followed_user.get("bio", "")
                    })
            except Exception as e:
                print(f"Error processing following {following_id}: {str(e)}")
                
        return jsonify(following)
    except Exception as e:
        print(f"Error getting following: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@user_routes.route("/username/<username>", methods=["GET"])
def get_user_by_username(username):
    try:
        # Get optional current user ID for checking follow status
        current_user_id = request.args.get('userId')
        
        # Find user by username
        user = mongo.db.users.find_one({"username": username})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if current user is following this user
        is_following = False
        if current_user_id:
            # Check if current user exists in this user's followers list
            is_following = current_user_id in [str(follower) for follower in user.get("followers_list", [])]
            
        return jsonify({
            "id": str(user.get("_id")),
            "name": user.get("name", "Unknown User"),
            "username": user.get("username", "unknown"),
            "email": user.get("email", ""),
            "avatar": user.get("avatar", "https://api.dicebear.com/7.x/adventurer/svg?seed=Default"),
            "bio": user.get("bio", ""),
            "following": user.get("following", 0),
            "followers": user.get("followers", 0),
            "location": user.get("location", ""),
            "website": user.get("website", ""),
            "banner": user.get("banner", ""),
            "joinDate": user.get("joinDate", ""),
            "isFollowing": is_following
        })
    except Exception as e:
        print(f"Error getting user by username: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
