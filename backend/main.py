"""
=============================================================
 main.py — FastAPI Server (Lead Intelligence System)
=============================================================
 The main entry point for the backend.
 
 What it does:
   1. ON STARTUP: Runs the CSV processing pipeline
   2. DAILY: APScheduler re-runs processing automatically
   3. ENDPOINTS: Serve processed leads to the React frontend
 
 Endpoints:
   GET /          → Health check
   GET /leads     → Returns all processed leads as JSON
   GET /refresh   → Manually re-trigger CSV processing
   GET /status    → Scheduler status + last update time
 
 Run with:
   uvicorn main:app --reload --port 8000
=============================================================
"""

import os
import json
import threading
from datetime import datetime
from contextlib import asynccontextmanager

from pydantic import BaseModel
from fastapi import FastAPI, BackgroundTasks, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from processor import process_csv, merge_and_save_upload
from scheduler import start_scheduler, get_scheduler_status
from auth import verify_password, create_access_token, verify_token, ADMIN_USERNAME

# Load environment variables (.env file)
load_dotenv()


# -------------------------------------------------------
# GLOBAL STATE
# -------------------------------------------------------
# In-memory cache of processed leads (updated after each run)
cached_leads: list = []
last_updated: str = "Never"
is_processing: bool = False


# -------------------------------------------------------
# STARTUP & SHUTDOWN EVENTS
# -------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs when the server starts and stops.
    
    On startup:
      1. Process the CSV immediately
      2. Start the daily scheduler
    """
    global cached_leads, last_updated

    print("\n[START] IntentPulse Backend Starting...")
    print("=" * 50)

    # --- Step 1: Run initial processing on startup ---
    print("[PROCESSING] Running initial CSV processing...")
    try:
        cached_leads = process_csv()
        last_updated = datetime.now().isoformat()
        print(f"[OK] Initial processing complete -- {len(cached_leads)} leads loaded")
    except Exception as e:
        print(f"[ERROR] Initial processing failed: {e}")
        cached_leads = []

    # --- Step 2: Start the daily scheduler ---
    print("\n[SCHEDULER] Starting daily scheduler...")
    start_scheduler()
    print("[OK] Scheduler active -- will refresh every 24 hours")
    print("=" * 50)

    yield  # Server is now running

    # --- Shutdown ---
    print("\n[STOP] IntentPulse Backend Shutting Down...")


# -------------------------------------------------------
# CREATE FASTAPI APP
# -------------------------------------------------------
app = FastAPI(
    title="IntentPulse - Lead Intelligence API",
    description="Processes company data, detects signals, scores leads, and generates AI insights.",
    version="1.0.0",
    lifespan=lifespan,
)


# -------------------------------------------------------
# CORS MIDDLEWARE
# -------------------------------------------------------
# Allow the React frontend (port 3000) to call our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Vite dev server
        "http://localhost:5173",       # Vite default port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",                           # Allow all in development
    ],
    allow_credentials=True,
    allow_methods=["*"],               # Allow GET, POST, etc.
    allow_headers=["*"],               # Allow all headers
)


# -------------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------------

@app.get("/")
def health_check():
    """
    Health check endpoint.
    Returns basic server info.
    """
    return {
        "status": "running",
        "service": "IntentPulse Lead Intelligence API",
        "version": "1.0.0",
        "total_leads": len(cached_leads),
        "last_updated": last_updated,
    }


class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    """
    Validates admin credentials and issues a JWT token.
    """
    if request.username != ADMIN_USERNAME or not verify_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token()
    return {"token": token, "username": ADMIN_USERNAME}


@app.get("/leads")
def get_leads(admin: str = Depends(verify_token)):
    """
    Returns all processed leads as a JSON array.
    
    The React frontend calls this endpoint to display data.
    Leads are sorted by score (highest first).
    """
    return {
        "status": "success",
        "total": len(cached_leads),
        "last_updated": last_updated,
        "leads": cached_leads,
    }


@app.get("/refresh")
def refresh_leads(background_tasks: BackgroundTasks, admin: str = Depends(verify_token)):
    """
    Manually triggers CSV re-processing.
    
    Runs in the background so the API responds immediately.
    The frontend can poll /status to check when it's done.
    """
    global is_processing

    if is_processing:
        return {
            "status": "already_running",
            "message": "Processing is already in progress. Check /status for updates.",
        }

    # --- Run processing in the background ---
    background_tasks.add_task(_background_refresh)

    return {"status": "refreshing", "message": "CSV processing started in the background."}


@app.post("/upload")
async def upload_leads_csv(background_tasks: BackgroundTasks, file: UploadFile = File(...), admin: str = Depends(verify_token)):
    """
    Accepts a custom CSV, merges it into the local database, and starts processing.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        contents = await file.read()
        added_count = merge_and_save_upload(contents)
        # Process the newly updated file
        background_tasks.add_task(_background_refresh)
        return {"status": "success", "message": f"Successfully merged {added_count} new leads and started processing."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
def get_status():
    """
    Returns the current system status.
    
    Useful for:
      - Checking if processing is running
      - Seeing when the last update happened
      - Monitoring the scheduler
    """
    scheduler_info = get_scheduler_status()

    return {
        "status": "running",
        "is_processing": is_processing,
        "total_leads": len(cached_leads),
        "last_updated": last_updated,
        "scheduler": scheduler_info,
    }


# -------------------------------------------------------
# BACKGROUND TASK
# -------------------------------------------------------
def _background_refresh():
    """
    Runs CSV processing in a background thread.
    Updates the global cached_leads when done.
    """
    global cached_leads, last_updated, is_processing

    is_processing = True
    print("\n[REFRESH] Manual refresh triggered...")

    try:
        leads = process_csv()
        cached_leads = leads
        last_updated = datetime.now().isoformat()
        print(f"[OK] Refresh complete -- {len(leads)} leads updated")
    except Exception as e:
        print(f"[ERROR] Refresh failed: {e}")
    finally:
        is_processing = False
