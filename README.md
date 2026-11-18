# BreatheWise AI – Smart Air Pollution & Winter Smog Assistant

> **Tagline:** Breathe Better. Live Smarter. Protect Your Community.

BreatheWise AI is an intelligent, full-stack, GenAI-powered atmospheric health and pollution management platform designed to help families and communities navigate severe winter smog and urban air pollution. 

Rather than merely displaying raw AQI numbers, BreatheWise explains **what** people should do, **why** they should do it, and the **estimated environmental and personal health impacts** of their daily choices.

---

## 🌟 Key Features

### 1. Smart Air Quality Dashboard
- **Real-Time Data:** Live US AQI, PM2.5, PM10, Carbon Monoxide, Nitrogen Dioxide, Ozone, Temperature, and Humidity via Open-Meteo European Atmosphere Monitoring Models.
- **Diurnal 24h Trajectory & Forecast:** Interactive Recharts area chart showing historical 24h readings and next 24h predictive trajectory.
- **Visual Alert System:** Dynamic color-coded EPA categories (Good, Moderate, USG, Unhealthy, Very Unhealthy, Hazardous) with immediate winter smog inversion alerts.
- **Global Search & Geolocation:** Instant city search with autocomplete and 1-click browser GPS location detection.
- **Transparent Attribution:** Clear indicators distinguishing live API data from simulated offline fallback states.

### 2. Conversational GenAI Pollution Assistant
- Context-aware atmospheric assistant powered by **Groq API** open-weight models (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).
- Automatically ingests real-time AQI, local temperature/inversion factors, and family health vulnerabilities (asthma, children, seniors).
- **Zero-Failure Rule Engine Fallback:** Seamlessly switches to an expert atmospheric rules engine when API keys are absent or network is offline.
- Non-alarmist, scientifically grounded, strictly avoids unsupported medical claims.

### 3. Personalized Daily Routine Planner
- Analyzes hourly pollution curves to calculate **safer outdoor activity windows** (e.g., midday solar dispersion vs. dawn inversions).
- Generates structured **Morning**, **Afternoon**, and **Evening** routines explaining the exact scientific *why* behind every recommendation.
- Provides low-emission commuting guidance, indoor cardio/exercise alternatives, and school/workplace safety advisories.

### 4. Indoor Air Quality Coach
- **Interactive Home Safety Audit:** Room-by-room checkup with real-time protective score calculation.
- **The Corsi-Rosenthal DIY Box Purifier Blueprint:** Step-by-step assembly guide for building a $65 high-CADR air cleaner from box fans and MERV-13 filters.
- **Smart Ventilation Windows:** Thermal inversion timing rules (why to seal during 6 AM - 10 AM, when to briefly flush).
- **The Houseplant Reality Check:** Debunks the indoor houseplant myth with peer-reviewed EPA science, explaining why mechanical filtration is required for PM2.5.

### 5. Sustainable Alternatives & Commute Comparator
- Practical low-emission lifestyle choices: electrified transit, anti-idling discipline, carpooling, domestic heating electrification.
- **Interactive Commute Carbon Comparator:** Side-by-side comparison of Solo Gasoline Car vs. Carpooling vs. Electric Metro vs. Walking across custom trip distances.

### 6. Personal Impact & Emissions Tracker
- Tracks estimated vehicle emissions avoided (kg CO2e), car trips replaced, clean kilometers traveled, and logged activities.
- 7-day visual emissions avoidance progress bar chart.
- **Mandatory Scientific Distinction:** Clear disclaimer distinguishing global greenhouse gas mitigation (CO2e) from direct personal particulate exposure reduction (PM2.5).

### 7. Community Awareness & Safety Alerts
- Verified community winter smog challenges (e.g., *School Zone Anti-Idling Pledge*, *Car-Free Winter Friday*).
- Peer-reviewed educational cards on winter smog physics, mask efficacy (N95 vs. surgical/cloth), and kitchen cooking ventilation.
- **Shareable Bulletin Generator:** 1-click formatted alert text ready for family WhatsApp groups and community portals.

### 8. Household Profile & Settings
- Granular vulnerability flags: Asthma/respiratory condition, young children, elderly family members, outdoor athletes.
- Optional client-side Groq API key override stored securely in local browser session.

---

## 🛠️ Technology Stack (100% Free Tiers Only)

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, HTTPX |
| **AI / GenAI** | Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) + Built-in Rule Engine Fallback |
| **Air Quality & Weather Data** | Open-Meteo European Air Quality & Atmosphere API (No API key required, 100% free) |
| **Geocoding** | Open-Meteo Global Geocoding API |
| **Deployment Targets** | Vercel (Frontend), Render (Backend) |

---

## 🚀 Exact Local Run Commands

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+

### 1. Start the FastAPI Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Set your Groq API Key in .env or run directly with rule-based fallback
# Copy .env.example to .env
cp .env.example .env

# Run FastAPI backend with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be running at: `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`).

### 2. Start the React Frontend
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at: `http://localhost:5173`.

---

## ☁️ Deployment Configuration

### Render (Backend)
- **Service Type:** Web Service
- **Root Directory:** `backend`
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.11.8`
  - `GROQ_API_KEY`: *(Your free Groq API key, optional - fallback active if omitted)*
  - `GROQ_MODEL`: `llama-3.3-70b-versatile`
  - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`

*(A pre-configured `render.yaml` is provided in the repository root for 1-click blueprint deploy).*

### Vercel (Frontend)
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: `https://your-render-backend.onrender.com` *(or leave blank if proxying)*

*(A pre-configured `vercel.json` is provided in `frontend/vercel.json` with SPA routing rules).*

---

## 🔒 Security & Privacy Practices
- **No Hardcoded Keys:** All secret tokens are strictly loaded via environment variables (`.env`).
- **Comprehensive `.gitignore`:** Completely excludes `.env`, `node_modules`, `venv`, `dist`, `__pycache__`, and log files.
- **Repository Size Compliance:** Tracked repository size strictly maintained under 10 MB.
- **Data Minimization:** No personal data or location coordinates are stored on servers without explicit user request.

---

## 📄 License
This project is open-source and available under the **MIT License**.
