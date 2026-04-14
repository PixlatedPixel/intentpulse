import requests, os
from dotenv import load_dotenv
load_dotenv()

GROQ_KEY = os.getenv("GROQ_API_KEY", "")
OR_KEY = os.getenv("OPENROUTER_API_KEY", "")
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

print("=== API HEALTH CHECK ===\n")

# --- GROQ ---
print("[1] GROQ (llama-3.1-8b-instant)...")
try:
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": 'Reply with exactly this JSON: {"summary": "ok", "pitch": "ok"}'}],
            "max_tokens": 30
        },
        timeout=15
    )
    d = r.json()
    if "choices" in d:
        print("   STATUS: OK")
        print("   RESPONSE:", d["choices"][0]["message"]["content"].strip()[:80])
    else:
        print("   STATUS: FAIL")
        print("   ERROR:", d.get("error", {}).get("message", str(d)))
except Exception as e:
    print("   STATUS: ERROR -", e)

print()

# --- GEMINI ---
print("[2] GEMINI (gemini-2.0-flash)...")
if not GEMINI_KEY:
    print("   STATUS: SKIPPED (no key in .env)")
else:
    try:
        r = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": "Say OK"}]}]},
            timeout=15
        )
        d = r.json()
        if "error" in d:
            print("   STATUS: FAIL -", d["error"].get("message", "unknown error"))
        else:
            print("   STATUS: OK")
    except Exception as e:
        print("   STATUS: ERROR -", e)

print()

# --- OPENROUTER ---
print("[3] OPENROUTER (gemma-3-12b-it:free)...")
try:
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OR_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://intentpulse.app",
            "X-Title": "IntentPulse"
        },
        json={
            "model": "google/gemma-3-12b-it:free",
            "messages": [{"role": "user", "content": 'Reply with exactly this JSON: {"summary": "ok", "pitch": "ok"}'}],
            "max_tokens": 30
        },
        timeout=30
    )
    d = r.json()
    if "choices" in d:
        print("   STATUS: OK")
        print("   RESPONSE:", d["choices"][0]["message"]["content"].strip()[:80])
    else:
        print("   STATUS: FAIL")
        print("   ERROR:", d.get("error", {}).get("message", str(d)))
except Exception as e:
    print("   STATUS: ERROR -", e)

print("\n=== DONE ===")
