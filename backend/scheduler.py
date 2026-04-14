"""
=============================================================
 scheduler.py — Automatic Daily Update Scheduler
=============================================================
 Uses APScheduler to run the CSV processing pipeline
 automatically every 24 hours.
 
 Features:
   - Runs processing on a background thread
   - Won't interfere with API requests
   - Logs each run with timestamps
   - Thread-safe — won't start duplicate jobs
=============================================================
"""

import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from processor import process_csv

# --- Set up logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler")


# -------------------------------------------------------
# GLOBAL SCHEDULER STATE
# -------------------------------------------------------
# We track these so the /status endpoint can report them
last_run_time = None
last_run_status = None
is_running = False

# The scheduler instance (created once)
_scheduler = None


def _run_daily_job():
    """
    The function that APScheduler calls every 24 hours.
    Runs the full CSV processing pipeline.
    """
    global last_run_time, last_run_status, is_running

    # --- Prevent duplicate runs ---
    if is_running:
        logger.warning("[WARN] Pipeline already running, skipping this run")
        return

    is_running = True
    logger.info("=" * 50)
    logger.info(f"[SCHEDULED] Run starting at {datetime.now().isoformat()}")
    logger.info("=" * 50)

    try:
        # --- Run the pipeline ---
        leads = process_csv()
        last_run_time = datetime.now().isoformat()
        last_run_status = f"Success -- {len(leads)} leads processed"
        logger.info(f"[OK] Scheduled run complete: {last_run_status}")

    except Exception as e:
        last_run_time = datetime.now().isoformat()
        last_run_status = f"Error -- {str(e)}"
        logger.error(f"[ERROR] Scheduled run failed: {e}")

    finally:
        is_running = False


def start_scheduler() -> BackgroundScheduler:
    """
    Starts the APScheduler background scheduler.
    
    Schedule:
        - Runs `process_csv()` every 24 hours
        - First run is triggered separately on startup (see main.py)
    
    Returns:
        The BackgroundScheduler instance
    """
    global _scheduler

    # --- Don't create duplicate schedulers ---
    if _scheduler is not None:
        logger.warning("[WARN] Scheduler already running, not starting again")
        return _scheduler

    logger.info("[SCHEDULER] Starting APScheduler (daily interval: 24 hours)")

    # --- Create the scheduler ---
    _scheduler = BackgroundScheduler()

    # --- Add the daily job ---
    # Runs every 24 hours (86400 seconds)
    _scheduler.add_job(
        _run_daily_job,                     # Function to call
        trigger=IntervalTrigger(hours=24),   # Every 24 hours
        id="daily_csv_update",              # Unique job ID
        name="Daily CSV Processing",         # Human-readable name
        replace_existing=True,              # Don't duplicate if restarted
    )

    # --- Start the scheduler ---
    _scheduler.start()
    logger.info("[OK] Scheduler started -- next run in 24 hours")

    return _scheduler


def get_scheduler_status() -> dict:
    """
    Returns the current status of the scheduler.
    Used by the /status API endpoint.
    
    Returns:
        Dictionary with scheduler state info
    """
    return {
        "scheduler_running": _scheduler is not None and _scheduler.running,
        "last_run_time": last_run_time,
        "last_run_status": last_run_status,
        "is_currently_processing": is_running,
        "next_run": str(_scheduler.get_jobs()[0].next_run_time) if _scheduler and _scheduler.get_jobs() else None,
    }
