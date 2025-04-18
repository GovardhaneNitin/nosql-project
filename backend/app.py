from flask import Flask
from routes.user_routes import user_routes
from routes.tweet_routes import tweet_routes
from config import mongo

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/social_mit"
mongo.init_app(app)

# Register routes
app.register_blueprint(user_routes, url_prefix="/api/users")
app.register_blueprint(tweet_routes, url_prefix="/api/tweets")

if __name__ == "__main__":
    app.run(debug=True)
