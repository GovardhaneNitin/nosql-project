from flask_pymongo import PyMongo
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create MongoDB connection
mongo = PyMongo()

def init_db(app):
    """Initialize database with app context and verify connection"""
    mongo.init_app(app)
    
    # Verify connection
    try:
        # Access a collection to test the connection
        mongo.db.command('ping')
        logger.info("MongoDB connection successful")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection failed: {str(e)}")
        return False
