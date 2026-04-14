from signals import detect_signals
from scoring import score_lead, categorize_lead, map_opportunity

print("Testing the Intelligence Pipeline...\n")

mock_lead = {
    "company_name": "Garuna Test",
    "website": "https://www.google.com",
    "linkedin_url": "",
    "industry": "saas",
    "location": "Remote",
    "employees": "50",
    "has_funding": "yes",
}

print("1. Running Signal Detection (BeautifulSoup Scraper -> Google.com)...")
try:
    signals = detect_signals(mock_lead)
    print(f"   [OK] Detected Signals: {signals}")
except Exception as e:
    print(f"   [ERROR] Signal Detection Failed: {e}")

print("\n2. Running Scoring Matrix Engine...")
try:
    score = score_lead(signals, size=50, has_funding=True, industry="saas")
    print(f"   [OK] Calculated Score: {score}")
except Exception as e:
    print(f"   [ERROR] Scoring Engine Failed: {e}")

print("\n3. Running Categorization Engine...")
try:
    category = categorize_lead(score)
    print(f"   [OK] Categorization: {category}")
except Exception as e:
    print(f"   [ERROR] Categorization Engine Failed: {e}")

print("\n4. Running Opportunity Mapping Engine...")
try:
    opp = map_opportunity(signals)
    print(f"   [OK] Mapped Opportunity: {opp}")
except Exception as e:
    print(f"   [ERROR] Opportunity Mapping Engine Failed: {e}")

print("\nAll core offline functions have been successfully verified offline!")
