import os
import psycopg2
import psycopg2.extras
from psycopg2 import tz
from dotenv import load_dotenv
from .nlp_processor import process_text_batch
from .social_client import fetch_recent_posts
from datetime import datetime

load_dotenv()

# MOCK GEOCODING FUNCTION
# In production, replace this with a call to a real geocoding service.
def geocode_locations(location_names: list[str]) -> tuple[float, float] | None:
    """Takes a list of location names and returns the coordinates for the first one found."""
    if not location_names:
        return None
    
    mock_geo_db = {
        "visakhapatnam": (17.6868, 83.2185),
        "mumbai": (19.0760, 72.8777),
        "kerala": (10.8505, 76.2711)
    }

    for name in location_names:
        coords = mock_geo_db.get(name.lower().strip())
        if coords:
            print(f"Geocoded '{name}' to {coords}")
            return coords
    
    print(f"Could not geocode any of: {location_names}")
    return None


def run_ingestion_pipeline():
    """Main function to run the data ingestion and processing pipeline."""
    db_conn = None
    try:
        db_conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        print("Database connection successful.")
        
        posts = fetch_recent_posts()
        if not posts:
            print("No new posts to process.")
            return

        source_ids = [post['id'] for post in posts]
        with db_conn.cursor() as cur:
            cur.execute("SELECT source_id FROM public.social_media_posts WHERE source_id = ANY(%s)", (source_ids,))
            existing_ids = {row[0] for row in cur.fetchall()}
        
        new_posts = [post for post in posts if post['id'] not in existing_ids]
        if not new_posts:
            print("No new posts to process after filtering.")
            return

        texts_to_process = [post['text'] for post in new_posts]
        print(f"Processing {len(texts_to_process)} new posts with NLP models...")
        nlp_results = process_text_batch(texts_to_process)

        records_to_insert = []
        for i, post in enumerate(new_posts):
            result = nlp_results[i]
            
            coordinates = geocode_locations(result.get('extracted_locations', []))
            # Format for PostGIS insertion (POINT(lng lat))
            location_wkt = f"POINT({coordinates[1]} {coordinates[0]})" if coordinates else None

            records_to_insert.append((
                post['id'],
                'twitter',
                post.get('author'),
                post['text'],
                post.get('created_at'),
                result.get('sentiment'),
                result.get('sentiment_score'),
                result.get('topic'),
                result.get('topic_score'),
                'processed',
                datetime.now(tz=tz.FixedOffsetTimezone(offset=0, name=None)),
                location_wkt
            ))

        with db_conn.cursor() as cur:
            insert_query = """
                INSERT INTO public.social_media_posts (
                    source_id, source_platform, author, raw_text, posted_at,
                    sentiment, sentiment_score, topic, topic_score,
                    status, processed_at, extracted_location
                ) VALUES %s
            """
            psycopg2.extras.execute_values(cur, insert_query, records_to_insert)
            db_conn.commit()
        
        print(f"Successfully processed and inserted {len(records_to_insert)} new posts.")

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        if db_conn:
            db_conn.rollback()
    finally:
        if db_conn:
            db_conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    run_ingestion_pipeline()