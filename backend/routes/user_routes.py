from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config import mongo
from bson.objectid import ObjectId

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/", methods=["GET"])
def get_users():
    users = mongo.db.users.find()
    return jsonify([{
        "id": str(user["_id"]),
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "tweets": user.get("tweets", [])
    } for user in users])

@user_routes.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if mongo.db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already exists"}), 400
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
    }
    mongo.db.users.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201

@user_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    user = mongo.db.users.find_one({"email": data["email"]})
    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "id": str(user["_id"]),
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "avatar": user.get("avatar", ""),
        "bio": user.get("bio", ""),
        "following": user["following"],
        "followers": user["followers"],
    })

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
