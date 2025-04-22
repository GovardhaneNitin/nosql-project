from flask import Flask, jsonify
from flask_cors import CORS  # Add CORS support
from routes.user_routes import user_routes
from routes.tweet_routes import tweet_routes
from config import mongo, init_db
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config["MONGO_URI"] = "mongodb://localhost:27017/social_mit?directConnection=true"

# Initialize database
db_connected = init_db(app)
if not db_connected:
    logger.error("Failed to connect to MongoDB. Please check your connection.")
    logger.error("Make sure MongoDB is running on localhost:27017")

# Register routes
app.register_blueprint(user_routes, url_prefix="/api/users")
app.register_blueprint(tweet_routes, url_prefix="/api/tweets")

@app.route("/api/health", methods=["GET"])
def health_check():
    """API health check endpoint"""
    try:
        # Test MongoDB connection
        mongo.db.command('ping')
        return jsonify({
            "status": "ok", 
            "database": "connected",
            "message": "API is running properly"
        })
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Health check failed: {error_msg}")
        return jsonify({
            "status": "error", 
            "database": "disconnected", 
            "error": error_msg,
            "message": "Please make sure MongoDB is running"
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
