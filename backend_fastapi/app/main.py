import os
import psycopg2
from fastapi import FastAPI, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from .pipeline import run_ingestion_pipeline

load_dotenv()
app = FastAPI(
    title="INCOIS Intelligence Core API",
    description="Microservice for NLP and data ingestion tasks."
)

@app.get("/health", tags=["Health Check"])
def health_check():
    """Checks the service status and its ability to connect to the database."""
    db_conn = None
    try:
        db_conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cur = db_conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        return {"status": "ok", "database_connection": "successful"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {e}")
    finally:
        if db_conn:
            db_conn.close()

@app.post("/trigger-ingestion", tags=["Pipeline"])
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """
    Triggers the data ingestion pipeline to run as a background task.
    This is the recommended endpoint for a cron job to call.
    """
    try:
        background_tasks.add_task(run_ingestion_pipeline)
        return {"message": "Ingestion pipeline triggered successfully in the background."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))