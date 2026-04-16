# intentpulse
AI-powered lead intelligence system that detects high-intent companies using real-time signals like hiring, growth, and digital gaps, and prioritizes them for targeted outreach.

## Setup

first create a .env file in the backend folder and add the following variables:
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key


then run the following commands in a new terminal:
cd backend
then:
python -m uvicorn main:app --reload --port 8000
and wait for the server to start

then run the following commands in a new terminal:
cd frontend
npm install
npm run dev

then open your browser and go to http://localhost:3000
