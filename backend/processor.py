"""
=============================================================
 processor.py — Central CSV Processing Pipeline
=============================================================
 This is the HEART of the system. It:
   1. Loads the original companies.csv
   2. Cleans and standardizes data
   3. Runs signal detection on each company
   4. Scores and categorizes each lead
   5. Generates AI summaries and pitches
   6. Saves updated_leads.csv (with new columns)
   7. Saves leads.json (for frontend consumption)
 
 Called by:
   - FastAPI on startup
   - APScheduler every 24 hours
   - Manual refresh endpoint
=============================================================
"""

import os
import json
import uuid
import pandas as pd
from datetime import datetime

from signals import detect_signals
from scoring import score_lead, categorize_lead, map_opportunity
from ai import generate_ai_bundle


# -------------------------------------------------------
# FILE PATHS
# -------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV = os.path.join(BASE_DIR, "companies.csv")
OUTPUT_CSV = os.path.join(BASE_DIR, "updated_leads.csv")

# Try to save leads.json into the frontend/public folder too
FRONTEND_JSON_PATHS = [
    os.path.join(BASE_DIR, "..", "frontend", "public", "leads.json"),
    os.path.join(BASE_DIR, "leads.json"),  # fallback: save in backend folder
]


# -------------------------------------------------------
# HELPER: Parse employee count strings
# -------------------------------------------------------
def _parse_employee_count(emp_str: str) -> int:
    """
    Converts employee range strings into usable integers.
    
    Examples:
        "201-500"  → 201
        "10000+"   → 10001
        "51-200"   → 51
        ""         → 50 (default)
    """
    emp_str = str(emp_str).strip().replace(",", "")

    # Handle empty / missing values
    if not emp_str or emp_str == "nan":
        return 50

    # Handle "10000+" format
    if "+" in emp_str:
        return int(emp_str.replace("+", "").strip()) + 1

    # Handle "201-500" range format — take the lower bound
    if "-" in emp_str:
        parts = emp_str.split("-")
        try:
            return int(parts[0].strip())
        except ValueError:
            return 50

    # Handle plain numbers
    try:
        return int(emp_str)
    except ValueError:
        return 50


# -------------------------------------------------------
# HELPER: Merge custom CSV
# -------------------------------------------------------
import io

def merge_and_save_upload(uploaded_bytes: bytes) -> int:
    """
    Takes uploaded CSV bytes, parses it, standardizes it, appends it 
    to companies.csv, deduplicates, and saves.
    Returns the number of net new companies added.
    """
    try:
        new_df = pd.read_csv(io.BytesIO(uploaded_bytes), encoding="utf-8")
        new_df.columns = new_df.columns.str.strip().str.lower().str.replace(" ", "_")
        
        # We need certain expected columns, ensure they exist gracefully
        expected_cols = ["company_name", "website", "linkedin_url", "industry", "location", "employees", "has_funding"]
        for col in expected_cols:
            if col not in new_df.columns:
                new_df[col] = "" # fallback default
                
        # Basic cleanup on the new DataFrame
        new_df["company_name"] = new_df["company_name"].fillna("Unknown Company").str.strip()
        new_df["website"] = new_df["website"].fillna("").str.strip()
        new_df = new_df[new_df["company_name"] != "Unknown Company"]
        new_df = new_df[new_df["company_name"] != ""]
        
        # Load existing
        if os.path.exists(INPUT_CSV):
            existing_df = pd.read_csv(INPUT_CSV, encoding="utf-8")
        else:
            existing_df = pd.DataFrame(columns=expected_cols)
            
        initial_len = len(existing_df)
            
        # Merge
        merged_df = pd.concat([existing_df, new_df], ignore_index=True)
        
        # Deduplicate based on exact website match OR company name match (skip blanks)
        # We drop duplicates, keeping the first occurrence (original data)
        merged_df = merged_df.drop_duplicates(subset=["company_name"], keep="first")
        merged_df = merged_df.drop_duplicates(subset=["website"], keep="first")
        
        # Save back
        merged_df.to_csv(INPUT_CSV, index=False, encoding="utf-8")
        
        final_len = len(merged_df)
        return final_len - initial_len
    except Exception as e:
        print(f"Error merging upload: {e}")
        raise e


# -------------------------------------------------------
# MAIN PROCESSING FUNCTION
# -------------------------------------------------------
def process_csv() -> list:
    """
    THE MAIN PIPELINE — processes the entire CSV file.
    
    Steps:
        1. Load companies.csv with pandas
        2. Clean and standardize columns
        3. For each company:
           a. Detect business signals
           b. Calculate lead score
           c. Categorize (High/Warm/Low)
           d. Map to service opportunity
           e. Generate AI summary
           f. Generate AI pitch
        4. Add new columns to DataFrame
        5. Save updated_leads.csv
        6. Save leads.json for frontend
    
    Returns:
        List of lead dictionaries (for the /leads API endpoint)
    """
    start_time = datetime.now()

    # ===========================================================
    # STEP 1: LOAD CSV
    # ===========================================================
    if not os.path.exists(INPUT_CSV):
        return []

    df = pd.read_csv(INPUT_CSV, encoding="utf-8")

    # ===========================================================
    # STEP 2: CLEAN DATA
    # ===========================================================
    # Standardize column names (lowercase, strip whitespace)
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # Fill missing values with sensible defaults
    df["company_name"] = df["company_name"].fillna("Unknown Company").str.strip()
    df["website"] = df["website"].fillna("").str.strip()
    df["linkedin_url"] = df["linkedin_url"].fillna("").str.strip()
    df["industry"] = df["industry"].fillna("General").str.strip()

    # --- Normalize messy/duplicate industry names into clean canonical values ---
    INDUSTRY_MAP = {
        # IT / Software
        "it services": "IT Services & Consulting",
        "it services and consulting": "IT Services & Consulting",
        "it services and consulting": "IT Services & Consulting",
        "it consulting": "IT Services & Consulting",
        "it services & consulting": "IT Services & Consulting",
        "information technology and services": "IT Services & Consulting",
        "technology, information and internet": "IT Services & Consulting",
        "technology, information and media": "IT Services & Consulting",
        "software development": "Software Development",
        "internet": "Software Development",
        # Finance
        "fintech": "FinTech",
        "financial technology": "FinTech",
        "financial services": "Financial Services",
        "insurance": "Insurance",
        # Logistics
        "logistics": "Logistics",
        "logistics and supply chain": "Logistics",
        # E-Commerce
        "e-commerce": "E-Commerce",
        # Business Services
        "business consulting and services": "Business Consulting",
        "business process management": "Business Consulting",
        "staffing and recruiting": "Staffing & Recruiting",
        "human resources services": "Staffing & Recruiting",
        # Healthcare / Fitness
        "health, wellness and fitness": "Health & Wellness",
        "fitness and wellness": "Health & Wellness",
        "medical devices and equipment": "Healthcare",
        # Manufacturing
        "automation machinery manufacturing": "Manufacturing",
        "automotive manufacturing": "Automotive",
        "automotive": "Automotive",
        "textile manufacturing": "Manufacturing",
        "industrial iot": "Manufacturing",
        "engineering & construction": "Engineering & Construction",
        # Consumer
        "consumer goods": "Consumer Goods",
        "advertising technology": "Advertising Technology",
        "entertainment / ticketing": "Entertainment",
        "conglomerate": "Conglomerate",
        "cloud kitchen": "Food & Beverage",
    }
    df["industry"] = df["industry"].apply(
        lambda x: INDUSTRY_MAP.get(x.strip().lower(), x.strip())
    )
    df["location"] = df["location"].fillna("Unknown").str.strip()
    df["employees"] = df["employees"].fillna("50").astype(str).str.strip()
    df["has_funding"] = df["has_funding"].fillna("no").astype(str).str.strip().str.lower()

    # Remove rows with no company name or website
    df = df[df["company_name"] != "Unknown Company"]

    # ===========================================================
    # STEP 3-5: PROCESS EACH COMPANY
    # ===========================================================

    # Prepare new column lists
    lead_scores = []
    categories = []
    signals_detected_list = []
    opportunities = []
    ai_summaries = []
    ai_pitches = []
    last_updated_list = []

    # Also build the leads list for JSON output
    leads_json = []

    total = len(df)
    for idx, row in df.iterrows():
        company = row["company_name"]
        i = list(df.index).index(idx) + 1
        print(f"[{i}/{total}] Processing {company:<40}", end="\r", flush=True)

        # --- Parse employee count ---
        emp_count = _parse_employee_count(row.get("employees", "50"))
        has_funding = str(row.get("has_funding", "no")).strip().lower() == "yes"

        # --- Build row dict for signal detection ---
        row_dict = {
            "company_name": company,
            "website": row.get("website", ""),
            "linkedin_url": row.get("linkedin_url", ""),
            "industry": row.get("industry", "General"),
            "location": row.get("location", "Unknown"),
            "employees": row.get("employees", "50"),
            "has_funding": row.get("has_funding", "no"),
        }

        # --- STEP 3: Detect signals ---
        signals = detect_signals(row_dict)

        # --- STEP 4: Score and categorize ---
        industry = row.get("industry", "General")
        score = score_lead(signals, emp_count, has_funding, industry)
        category = categorize_lead(score)
        opportunity = map_opportunity(signals)

        # --- STEP 5: Generate AI content (Unified Bundle) ---
        bundle = generate_ai_bundle(company, industry, signals, opportunity)
        summary = bundle.get("summary", "")
        pitch = bundle.get("pitch", "")

        # --- Store results ---
        timestamp = datetime.now().isoformat()
        lead_scores.append(score)
        categories.append(category)
        signals_detected_list.append(", ".join(signals))
        opportunities.append(opportunity)
        ai_summaries.append(summary)
        ai_pitches.append(pitch)
        last_updated_list.append(timestamp)

        # --- Build JSON lead object (for frontend) ---
        leads_json.append({
            "id": str(uuid.uuid4()),
            "company": company,
            "website": str(row.get("website", "")),
            "linkedin": str(row.get("linkedin_url", "")),
            "industry": industry,
            "location": str(row.get("location", "Unknown")),
            "size": emp_count,
            "score": score,
            "category": category,
            "signals": signals,
            "opportunity": opportunity,
            "lastSignalDate": datetime.now().strftime("%Y-%m-%d"),
            "insightSummary": summary,
            "pitchStarter": pitch,
            "contacted": False,
            "last_updated": timestamp,
        })

    # ===========================================================
    # STEP 6: UPDATE CSV WITH NEW COLUMNS
    # ===========================================================
    df["lead_score"] = lead_scores
    df["category"] = categories
    df["signals_detected"] = signals_detected_list
    df["opportunity"] = opportunities
    df["ai_summary"] = ai_summaries
    df["ai_pitch"] = ai_pitches
    df["last_updated"] = last_updated_list

    # Save the updated CSV
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")

    # ===========================================================
    # STEP 7: SAVE leads.json FOR FRONTEND
    # ===========================================================
    # Sort by score (highest first)
    leads_json.sort(key=lambda x: x["score"], reverse=True)

    for path in FRONTEND_JSON_PATHS:
        try:
            os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(leads_json, f, indent=2, ensure_ascii=False)
            print(f"  [OK] Saved: {path}")
        except Exception as e:
            print(f"  [WARN] Could not save to {path}: {e}")

    # ===========================================================
    # DONE — Print summary
    # ===========================================================
    elapsed = (datetime.now() - start_time).total_seconds()

    print("\n" + "=" * 60)
    print(f"  [DONE] Pipeline Complete -- {len(leads_json)} leads processed in {elapsed:.1f}s")
    print(f"  [HIGH] High Intent (80+):  {len([l for l in leads_json if l['score'] >= 80])}")
    print(f"  [WARM] Warm (60-79):       {len([l for l in leads_json if 60 <= l['score'] < 80])}")
    print(f"  [LOW]  Low (<60):          {len([l for l in leads_json if l['score'] < 60])}")
    print("=" * 60 + "\n")

    return leads_json
