"""
=============================================================
 scoring.py — Lead Scoring Engine
=============================================================
 Assigns a score (0–100) to each company based on detected
 signals, company size, and funding status.
 
 Also maps signals to recommended service opportunities.
=============================================================
"""


# -------------------------------------------------------
# SIGNAL POINT VALUES
# Each detected signal contributes points to the lead score
# -------------------------------------------------------

SIGNAL_POINTS = {
    "Recent Funding":               30,   # Strong buying signal
    "Hiring Ops / Support / HR":    25,   # Need for automation
    "Hiring Tech Roles":            20,   # Actively building tech
    "Outdated Website":             20,   # Obvious upgrade need
    "Low Digital Presence":         20,   # Needs help getting online
    "Needs Digital Presence":       20,   # Traditional industry signal
    "Scaling / Growth Announcements": 15, # Company is growing
    "High-Growth Industry":         10,   # Industry is hot
    "Digital Transformation":       15,   # Actively transforming
}

INDUSTRY_SCORES = {
    "fintech":                             20,
    "financial technology":                20,
    "financial services":                  17,
    "insurance":                           15,
    "saas":                                20,
    "software development":                18,
    "it services and consulting":          16,
    "it consulting":                       16,
    "it services":                         16,
    "it services ":                        16,
    "information technology and services": 16,
    "technology, information and internet":16,
    "technology, information and media":   15,
    "e-commerce":                          18,
    "internet":                            17,
    "logistics":                           17,
    "logistics and supply chain":          17,
    "healthcare":                          16,
    "health, wellness and fitness":        14,
    "fitness and wellness":                14,
    "medical devices and equipment":       15,
    "industrial iot":                      18,
    "automation machinery manufacturing":  15,
    "advertising technology":              16,
    "business consulting and services":    14,
    "business process management":         14,
    "human resources services":            13,
    "staffing and recruiting":             13,
    "consumer goods":                      12,
    "automotive":                          12,
    "automotive manufacturing":            12,
    "engineering & construction":          12,
    "cloud kitchen":                       11,
    "entertainment / ticketing ":          11,
    "textile manufacturing":               10,
    "conglomerate":                        12,
}

def _get_exact_employee_score(size: int) -> int:
    if size <= 10: return 2
    elif size <= 50: return 8
    elif size <= 200: return 14
    elif size <= 500: return 18
    elif size <= 1000: return 16
    elif size <= 5000: return 12
    elif size <= 10000: return 8
    else: return 5

def score_lead(signals: list, size: int, has_funding: bool = False, industry: str = "") -> int:
    """
    Calculates a lead score based on signals, company size, and funding.
    
    Scoring rules:
      - Each signal has a point value (see SIGNAL_POINTS above)
      - Funded companies get a +30 bonus
      - Mid-size companies (20–500 employees) get +15 bonus
        (they're big enough to buy, small enough to need help)
    
    Args:
        signals:     List of detected signal strings
        size:        Number of employees (integer)
        has_funding: Whether the company has received funding
    
    Returns:
        Integer score from 0 to 100
    """
    score = 0

    # --- Add points for each detected signal ---
    for signal in signals:
        score += SIGNAL_POINTS.get(signal, 0)

    # --- Funding bonus ---
    # Companies with funding have budget to spend
    if has_funding:
        score += 30

    # --- Company size bonus ---
    score += _get_exact_employee_score(size)

    # --- Industry bonus ---
    ind_lower = industry.strip().lower()
    score += INDUSTRY_SCORES.get(ind_lower, 10)

    # --- Normalize to 100 max ---
    return min(score, 100)


def categorize_lead(score: int) -> str:
    """
    Categorizes a lead based on their score.
    
    Categories:
      - High Intent 🔥   (80-100): Ready to buy, prioritize outreach
      - Warm 🌤️         (60-79):  Interested, needs nurturing
      - Low ❄️           (0-59):   Long-term prospect
    
    Args:
        score: Integer score from 0 to 100
    
    Returns:
        "High Intent 🔥", "Warm 🌤️", or "Low ❄️"
    """
    if score >= 80:
        return "High Intent 🔥"
    elif score >= 60:
        return "Warm 🌤️"
    else:
        return "Low ❄️"


def map_opportunity(signals: list) -> str:
    """
    Maps detected signals to the best service opportunity.
    
    Priority order (first match wins):
      1. Funded + Hiring Tech → Custom Software / MVP
      2. Hiring Ops/HR → Workflow Automation
      3. Outdated/Low Digital → Website / System Upgrade
      4. Scaling → CRM / ERP Customization
      5. Digital Transformation → Cloud / Infrastructure
      6. Default → Analytics Dashboard
    
    Args:
        signals: List of detected signal strings
    
    Returns:
        Service opportunity string
    """
    # --- Check signal combinations (most specific first) ---
    if "Recent Funding" in signals and "Hiring Tech Roles" in signals:
        return "Custom Software / MVP"

    if "Hiring Ops / Support / HR" in signals:
        return "Workflow Automation"

    if "Outdated Website" in signals or "Low Digital Presence" in signals:
        return "Website / System Upgrade"

    if "Needs Digital Presence" in signals:
        return "Website / System Upgrade"

    if "Scaling / Growth Announcements" in signals:
        return "CRM / ERP Customization"

    if "Digital Transformation" in signals:
        return "AI/ML Integration"

    if "High-Growth Industry" in signals:
        return "Analytics Dashboard"

    # --- Default fallback ---
    return "Analytics Dashboard"
