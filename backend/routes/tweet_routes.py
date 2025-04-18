from flask import Blueprint, request, jsonify
from config import mongo
from bson.objectid import ObjectId

tweet_routes = Blueprint("tweet_routes", __name__)

@tweet_routes.route("/", methods=["GET"])
def get_tweets():
    tweets = mongo.db.tweets.find()
    return jsonify([{
        "id": str(tweet["_id"]),
        "content": tweet["content"],
        "authorId": tweet["authorId"],
        "createdAt": tweet["createdAt"]
    } for tweet in tweets])

@tweet_routes.route("/", methods=["POST"])
def create_tweet():
    data = request.json
    user_id = data.get("authorId")
    if not user_id:
        return jsonify({"error": "Author ID is required"}), 400

    tweet = {
        "content": data["content"],
        "authorId": user_id,
        "createdAt": data["createdAt"]
    }
    result = mongo.db.tweets.insert_one(tweet)

    # Add tweet ID to the user's tweets list
    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"tweets": str(result.inserted_id)}}
    )

    return jsonify({"message": "Tweet created successfully", "tweetId": str(result.inserted_id)}), 201
