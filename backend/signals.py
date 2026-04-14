"""
=============================================================
 signals.py — Signal Detection Engine
=============================================================
 Detects business signals from company data.
 Uses a combination of:
   - CSV column analysis (funding, size, industry)
   - Website content scraping (keywords)
 
 Each signal maps to a business intent indicator.
=============================================================
"""

import requests
from bs4 import BeautifulSoup


# -------------------------------------------------------
# KEYWORD DICTIONARIES
# Each category maps to a signal name + keywords to look for
# -------------------------------------------------------

SIGNAL_KEYWORDS = {
    "Recent Funding": [
        "series a", "series b", "series c", "seed funding", 
        "seed round", "raised funding", "funding round", 
        "secured investment", "raised capital", "$1m", "$5m", "$10m",
        "venture capital", "angel investors"
    ],
    "Hiring Tech Roles": [
        "hiring", "careers", "join our team", "we're hiring",
        "join us", "open positions", "software engineer",
        "developer", "tech lead", "devops", "full stack",
        "frontend", "backend", "data scientist", "machine learning"
    ],
    "Hiring Ops / Support / HR": [
        "operations manager", "support executive", "hr executive",
        "data entry", "customer support", "helpdesk", "recruiter",
        "talent acquisition", "human resources", "admin assistant"
    ],
    "Scaling / Growth Announcements": [
        "expanding", "scaling", "new office", "growing team",
        "opened branch", "new market", "growth",
        "milestone", "100 employees", "500 employees",
        "new partnership", "strategic alliance", "expansion"
    ],
    "Outdated Website": [
        "©2019", "©2020", "©2018", "©2017",
        "copyright 2019", "copyright 2020", "copyright 2018",
        "copyright 2017", "under construction", "coming soon"
    ],
    "Digital Transformation": [
        "digital transformation", "modernize", "cloud migration",
        "legacy system", "automation", "digitize", "paperless",
        "erp implementation", "crm integration"
    ],
}


def _scrape_website_signals(website: str) -> list:
    """
    Scrapes the company website and checks for keyword matches.
    Returns a list of signal names found on the page.
    """
    signals = []

    try:
        # --- Fetch the website HTML ---
        response = requests.get(
            website,
            timeout=8,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        )
        
        # Use BeautifulSoup to pull clean human-readable text
        soup = BeautifulSoup(response.text, 'html.parser')
        visible_text = soup.get_text().lower()
        raw_text = response.text.lower() # Raw HTML

        # --- Check each signal category ---
        for signal_name, keywords in SIGNAL_KEYWORDS.items():
            if signal_name == "Outdated Website":
                # Check for outdated markers in the raw HTML
                if any(keyword in raw_text for keyword in keywords):
                    signals.append(signal_name)
            else:
                # For others, strictly check the visible text (avoids random HTML classes triggering "series")
                if any(keyword in visible_text for keyword in keywords):
                    signals.append(signal_name)

    except requests.exceptions.Timeout:
        # Website took too long — might be poorly maintained
        signals.append("Outdated Website")
    except requests.exceptions.ConnectionError:
        # Can't reach the site — dead or misconfigured
        signals.append("Outdated Website")
    except Exception:
        # Any other error — play it safe
        signals.append("Outdated Website")

    return signals


def _detect_csv_signals(row: dict) -> list:
    """
    Detects signals from the CSV row data itself (no web scraping).
    Looks at funding status, company size, and industry.
    """
    signals = []

    # --- Funding signal ---
    has_funding = str(row.get("has_funding", "no")).strip().lower() == "yes"
    if has_funding:
        signals.append("Recent Funding")

    # --- Industry-based signals ---
    industry = str(row.get("industry", "")).strip().lower()

    # Companies in fast-moving industries often need tech help
    growth_industries = [
        "fintech", "financial services", "e-commerce",
        "logistics", "health", "wellness", "edtech",
        "food", "cloud kitchen", "advertising"
    ]
    if any(gi in industry for gi in growth_industries):
        signals.append("High-Growth Industry")

    # Traditional industries may need digital help
    traditional_industries = [
        "manufacturing", "automotive", "textile",
        "construction", "engineering", "conglomerate"
    ]
    if any(ti in industry for ti in traditional_industries):
        signals.append("Needs Digital Presence")

    return signals


def detect_signals(row: dict) -> list:
    """
    MAIN FUNCTION — Detects all signals for a company.
    
    Combines:
      1. CSV column analysis (funding, industry)
      2. Website scraping (keywords)
    
    Args:
        row: Dictionary with company data from the CSV
             Expected keys: website, has_funding, industry, employees
    
    Returns:
        List of signal strings, e.g. ["Recent Funding", "Hiring Tech Roles"]
    """
    signals = []

    # --- Step 1: Detect signals from CSV data ---
    csv_signals = _detect_csv_signals(row)
    signals.extend(csv_signals)

    # --- Step 2: Detect signals from website ---
    website = str(row.get("website", "")).strip()
    if website:
        web_signals = _scrape_website_signals(website)
        signals.extend(web_signals)

    # --- Remove duplicates while preserving order ---
    seen = set()
    unique_signals = []
    for s in signals:
        if s not in seen:
            seen.add(s)
            unique_signals.append(s)

    # --- If no signals found, mark as low digital presence ---
    if not unique_signals:
        unique_signals = ["Low Digital Presence"]

    return unique_signals
