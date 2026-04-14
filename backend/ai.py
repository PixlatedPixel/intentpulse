"""
=============================================================
 ai.py — Multi-Agent AI Summary & Pitch Generator
=============================================================
 Uses a 5-tier fallback cascade to generate:
   - Insight summaries (why this company needs help)
   - Personalized pitch messages (outreach starters)

 Cascade Order (highest priority first):
   1. Groq API       (fast, free tier)
   2. Gemini API     (Google, free tier)
   3. OpenRouter     (free cloud models, great for deployment)
   4. Ollama         (local GPU, last resort)
   5. Templates      (offline fallback, always works)
=============================================================
"""

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# -------------------------------------------------------
# API CONFIGURATION
# -------------------------------------------------------
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # Fast free model from Groq

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "google/gemma-3-12b-it:free"  # 100% free model on OpenRouter


def _call_groq(prompt: str) -> str:
    """
    Sends a prompt to the Groq API and returns the response text.
    
    Args:
        prompt: The prompt string to send
    
    Returns:
        Response text from the model
    
    Raises:
        Exception if API call fails
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")

    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 400,
            "temperature": 0.7
        },
        timeout=15
    )

    # --- Parse the response ---
    data = response.json()
    text = data["choices"][0]["message"]["content"].strip()

    # --- Clean markdown code blocks if present ---
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return text


def _call_gemini(prompt: str) -> str:
    """
    Sends a prompt to the Google Gemini API natively via REST.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
        
    url = f"{GEMINI_API_URL}?key={api_key}"
    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json={
            "contents": [{"parts": [{"text": prompt}]}]
        },
        timeout=15
    )
    
    data = response.json()
    if "error" in data:
       raise Exception(str(data["error"]))
       
    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    
    # --- Clean markdown code blocks if present ---
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
        
    return text


def _call_openrouter(prompt: str) -> str:
    """
    Sends a prompt to OpenRouter's free cloud API.
    Uses google/gemini-2.0-flash-lite which is 100% free.
    Great for deployment — no local GPU required.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set in .env")

    response = requests.post(
        OPENROUTER_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://intentpulse.app",  # Required by OpenRouter
            "X-Title": "IntentPulse",
        },
        json={
            "model": OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 400,
            "temperature": 0.7
        },
        timeout=30
    )

    data = response.json()
    if "error" in data:
        raise Exception(f"OpenRouter error: {data['error']}")

    text = data["choices"][0]["message"]["content"].strip()

    # --- Clean markdown code blocks if present ---
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return text


def _call_ollama(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama server (last resort before templates).
    Requires Ollama running locally with llama3.2 pulled.
    """
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7
            },
            timeout=120  # Local generation can take time on laptops
        )
        data = response.json()
        text = data.get("response", "").strip()

        # --- Clean markdown code blocks if present ---
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        if not text:
            raise Exception("Ollama generated blank response")

        return text
    except requests.exceptions.ConnectionError:
        raise Exception("Ollama server not running on localhost:11434")


def generate_ai_bundle(company: str, industry: str,
                       signals: list, opportunity: str) -> dict:
    """
    Generates BOTH the summary and the pitch in a single AI cascade loop natively.
    Returns a JSON dict: {"summary": "...", "pitch": "..."}
    """
    signal_text = ", ".join(signals)

    prompt = f"""You are a B2B sales intelligence strategist analyzing a tech services agency's leads.
Company: {company}
Industry: {industry}
Detected Signals: {signal_text}
Recommended Service: {opportunity}

You must generate exactly two items:
1. A 2-sentence insight summary explaining what the signals indicate about this company's needs.
2. A 2-sentence personalized cold outreach pitch connecting the signals to the recommended service, ending with a soft CTA. Don't say "We can help you with tech", be specific.

You MUST return your response as a strictly valid JSON object exactly matching this structure, with no markdown, no quotes outside the JSON, and no conversational text:
{{
    "summary": "Your insight summary under 40 words here.",
    "pitch": "Your personalized pitch under 60 words here."
}}"""

    # --- 4-Tier Agent Waterfall (Ollama paused) ---
    try:
        raw_text = _call_groq(prompt)
        return json.loads(raw_text)
    except Exception as e_groq:
        try:
            raw_text = _call_gemini(prompt)
            return json.loads(raw_text)
        except Exception as e_gemini:
            try:
                # OpenRouter: free cloud fallback (perfect for deployment)
                raw_text = _call_openrouter(prompt)
                return json.loads(raw_text)
            except Exception as e_openrouter:
                # Ollama is paused — skip straight to offline templates
                # To re-enable: uncomment _call_ollama block below
                # try:
                #     raw_text = _call_ollama(prompt)
                #     return json.loads(raw_text)
                # except Exception as e_ollama:
                #     pass
                return {
                    "summary": _generate_template_summary(company, industry, signals, opportunity),
                    "pitch": _generate_template_pitch(company, industry, signals, opportunity)
                }


# =============================================================
# FALLBACK TEMPLATES (used when Groq API is down)
# =============================================================

def _generate_template_summary(company: str, industry: str,
                                signals: list, opportunity: str) -> str:
    """
    Rule-based summary generation — no API needed.
    Builds a summary by combining signal-specific sentence fragments.
    """
    parts = []

    if "Recent Funding" in signals:
        parts.append(f"{company} recently secured funding, indicating growth and budget for new tech initiatives")
    if "Hiring Tech Roles" in signals:
        parts.append(f"they are actively hiring tech talent, suggesting an expansion of their engineering capabilities")
    if "Hiring Ops / Support / HR" in signals:
        parts.append(f"operational hiring suggests growing pains that could benefit from workflow automation")
    if "Outdated Website" in signals or "Low Digital Presence" in signals:
        parts.append(f"their digital presence appears outdated, creating an opportunity for a modern upgrade")
    if "Scaling / Growth Announcements" in signals:
        parts.append(f"scaling announcements indicate rapid growth that may strain current systems")
    if "Needs Digital Presence" in signals:
        parts.append(f"as a {industry} company, digital transformation is likely a strategic priority")
    if "High-Growth Industry" in signals:
        parts.append(f"operating in the high-growth {industry} sector means competitive pressure to adopt technology")
    if "Digital Transformation" in signals:
        parts.append(f"active digital transformation signals indicate readiness for technology partnerships")

    if not parts:
        parts.append(f"{company} in {industry} shows early-stage signals worth monitoring")

    # --- Combine into 2 sentences ---
    summary = f"{parts[0].capitalize()}. "
    if len(parts) > 1:
        summary += f"Additionally, {parts[1]}."
    else:
        summary += f"This positions {opportunity.lower()} as a relevant conversation starter."

    return summary


def _generate_template_pitch(company: str, industry: str,
                              signals: list, opportunity: str) -> str:
    """
    Rule-based pitch generation — no API needed.
    Creates a personalized outreach message from templates.
    """
    # --- Pick the strongest signal for personalization ---
    if "Recent Funding" in signals:
        hook = f"Congrats on the recent funding round at {company}!"
        body = f"Many {industry} companies at this stage invest in {opportunity.lower()} to scale efficiently — GarunaCDX specializes in exactly that."
    elif "Hiring Tech Roles" in signals:
        hook = f"Noticed {company} is scaling the tech team — exciting times!"
        body = f"We've helped similar {industry} companies accelerate delivery with {opportunity.lower()} solutions."
    elif "Outdated Website" in signals or "Low Digital Presence" in signals:
        hook = f"Hi! I was exploring {company}'s website and noticed some opportunities to modernize the experience."
        body = f"GarunaCDX has helped {industry} companies upgrade their digital presence — would a quick chat be useful?"
    elif "Scaling / Growth Announcements" in signals:
        hook = f"Saw that {company} is scaling — impressive growth!"
        body = f"As companies grow, {opportunity.lower()} becomes critical. GarunaCDX can help streamline that transition."
    else:
        hook = f"Hi! I came across {company} and was impressed by your work in {industry}."
        body = f"GarunaCDX helps companies like yours with {opportunity.lower()} — would a 15-minute intro call be useful?"

    return f"{hook} {body}"
