def score_lead(signals: list, size: int, has_funding: bool = False) -> int:
    score = 0
    points = {
        "Recent Funding": 30,
        "Hiring Ops / Support / HR": 25,
        "Hiring Tech Roles": 20,
        "Outdated Website": 20,
        "Scaling / Growth Announcements": 15,
    }
    for s in signals:
        score += points.get(s, 0)
    if has_funding:
        score += 30
    if 20 <= size <= 250:
        score += 15
    return min(score, 100)

def get_priority(score: int) -> str:
    if score >= 80: return "High Intent"
    if score >= 60: return "Warm"
    return "Low"

def map_opportunity(signals: list) -> str:
    if "Recent Funding" in signals and "Hiring Tech Roles" in signals:
        return "Custom Software / MVP"
    if "Hiring Ops / Support / HR" in signals:
        return "Workflow Automation"
    if "Outdated Website" in signals:
        return "Website / System Upgrade"
    if "Scaling / Growth Announcements" in signals:
        return "CRM / ERP Customization"
    return "Analytics Dashboard"
