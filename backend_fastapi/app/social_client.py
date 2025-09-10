from datetime import datetime, timezone

def fetch_recent_posts():
    """Simulates fetching recent posts from a social media platform."""
    print("Fetching mock data from social_media_client...")
    return [
        {'id': 'tweet_101', 'text': 'A massive cyclone is expected to make landfall near Visakhapatnam tomorrow.', 'author': 'user_A', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'tweet_102', 'text': 'The weather today in Mumbai is beautiful and sunny.', 'author': 'user_B', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': 'tweet_103', 'text': 'Reports of high tides along the coast of Kerala.', 'author': 'user_C', 'created_at': datetime.now(timezone.utc).isoformat()},
        # Add a tweet that won't be geocoded to test the fallback
        {'id': 'tweet_104', 'text': 'Amazing satellite imagery of the Indian Ocean.', 'author': 'user_D', 'created_at': datetime.now(timezone.utc).isoformat()},
    ]