import requests
import os
import json

def generate_pitch(company: str, industry: str, 
                   signals: list, opportunity: str) -> dict:
    
    signal_text = ", ".join(signals)
    prompt = f"""You are a sales assistant for GarunaCDX, an Indian software agency.
Company: {company}
Industry: {industry}
Signals: {signal_text}
Recommended service: {opportunity}

Return ONLY a raw JSON object with two keys:
- insightSummary: 2 sentence analysis of why this company needs tech help now
- pitchStarter: 2 sentence personalized outreach message referencing their signals

No markdown, no backticks. Just the JSON."""

    try:
        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-8b-8192",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300,
                "temperature": 0.7
            }
        )
        text = r.json()['choices'][0]['message']['content'].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)

    except Exception as e:
        print(f"  Pitch error for {company}: {e}")
        return {
            "insightSummary": f"{company} in {industry} shows signals: {signal_text}.",
            "pitchStarter": f"Hi, noticed {company} could benefit from {opportunity}. GarunaCDX has helped similar companies — would a quick call work?"
        }