# ⚽ Soccer Scouting Analytics Platform

> A full-stack, AI-powered player scouting application connecting a live **Google BigQuery** data warehouse to a **React/TypeScript** frontend — with **Google Gemini AI** generating structured, comparison-driven scouting intelligence in real time.

![React](https://img.shields.io/badge/React_19-TypeScript-blue?style=flat-square&logo=react)
![BigQuery](https://img.shields.io/badge/Google-BigQuery-4285F4?style=flat-square&logo=googlebigquery)
![Express](https://img.shields.io/badge/Express.js-API_Server-black?style=flat-square&logo=express)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-34A853?style=flat-square&logo=google)
![Firebase](https://img.shields.io/badge/Deployed-Firebase-orange?style=flat-square&logo=firebase)
![Dataset](https://img.shields.io/badge/Dataset-FIFA_19_%7C_18K%2B_Players-red?style=flat-square)

---

## 🔗 Live Demo

👉 **[View Live App](https://soccer-scouting-app.web.app/)**

---

## 📌 Project Overview

This project is a production-ready analytics platform for data-driven football scouting. It ingests a FIFA 19 dataset of 18,000+ players from **Google BigQuery**, serves it through a **Node.js/Express REST API**, and visualises it in a responsive **React** dashboard — with **Google Gemini 2.5 Flash** generating expert-level, structured scouting reports on demand.

The architecture mirrors a real-world sports analytics stack: a cloud data warehouse feeding a backend API, consumed by an interactive frontend with AI-generated insight layers. It was built end-to-end as part of my **Data Science & Analytics Portfolio** to demonstrate the full spectrum from data engineering to UI/UX.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Google Cloud Platform                   │
│                                                           │
│   ┌─────────────────────────────────────┐                │
│   │  BigQuery                           │                │
│   │  player-profiles-analyzer           │                │
│   │  └── Player_Analyzer               │                │
│   │       └── Player_profiles (18K+)   │                │
│   └──────────────┬──────────────────────┘                │
│                  │  SQL query (parameterised)             │
│   ┌──────────────▼──────────────────────┐                │
│   │  Express.js API Server (TypeScript) │                │
│   │  GET /api/players                   │                │
│   │  GET /api/health                    │                │
│   └──────────────┬──────────────────────┘                │
└──────────────────┼─────────────────────────────────────-─┘
                   │  REST (proxied via Vite in dev)
   ┌───────────────▼──────────────────────┐
   │  React 19 + TypeScript (Vite)        │
   │  ├── Player grid  (live BQ data)     │
   │  ├── Stat charts  (Recharts)         │
   │  └── AI panel     (Gemini API)       │
   └──────────────────────────────────────┘
```

---

## 🧠 Skills Demonstrated

### 1. Cloud Data Engineering — Google BigQuery
- Designed and queried a BigQuery dataset (`Player_Analyzer.Player_profiles`) using **parameterised Standard SQL** with backtick-quoted column names, `SAFE_CAST`, and dynamic `WHERE` clauses
- Implemented server-side filtering by position and name/club search directly in SQL to avoid pulling unnecessary data
- Managed **Application Default Credentials (ADC)** via `gcloud auth application-default` and `set-quota-project` — no key files required
- Handled real-world BigQuery schema quirks (space-containing column names like `` `Club Logo` ``, integer vs string IDs)

### 2. Backend API Development — Node.js / Express / TypeScript
- Built a standalone **Express.js REST API server** (`server.ts`) in TypeScript, run via `tsx`
- Integrated `@google-cloud/bigquery` client with project/dataset/table configuration via environment variables
- Loaded secrets from `.env.local` using `dotenv` at server startup — cleanly separated from the Vite frontend environment
- Added `/api/health` endpoint reporting live BigQuery connection metadata
- Designed the API to serve the built frontend's static files in production (`NODE_ENV=production`)

### 3. Frontend Engineering — React 19 / TypeScript / Vite
- Architected a modular React app with clear separation of concerns: data fetching (`services/players.ts`), AI (`services/gemini.ts`), and UI (`App.tsx`)
- Leveraged `useEffect`, `useState`, `useMemo`, and `useCallback` to manage async BigQuery data loading, client-side search filtering, and derived chart data efficiently
- Configured **Vite dev proxy** to forward `/api` requests to the Express backend, enabling seamless local development without CORS issues
- Implemented graceful loading, error, and empty states throughout — users always know the status of the BigQuery connection

### 4. AI / LLM Integration — Google Gemini 2.5 Flash
- Integrated **Google Gemini 2.5 Flash** via `@google/genai` with **structured JSON output** enforced through a typed response schema (`responseMimeType: "application/json"`)
- Engineered dynamic prompts that switch between **single-player analysis** and **head-to-head comparison** modes depending on context
- Defined a rich 12-field `ScoutingReport` schema including `potentialRating`, `potentialTimeline`, `potentialDescription`, `bestFormations`, `idealRole`, `tacticalDescription`, `comparisonVerdict`, and `keyDifference`
- Handled null/empty responses with clear, actionable error messages surfaced directly in the UI

### 5. Data Visualisation — Recharts
- Built three interactive chart types from BigQuery player stats: **vertical bar chart** (percentile comparisons), **radar chart** (tactical profile), and **line chart** (form trend over time)
- Wired all charts to support **dual-player overlay** — primary player in indigo, comparison player in pink — with a single shared data model
- Used `useMemo` for all chart data derivations to avoid unnecessary re-renders on large player lists

### 6. Data Pipeline & Transformation
- Mapped raw FIFA abbreviated positions (e.g. `ST`, `CDM`, `LCB`) to readable labels (`Forward`, `Midfielder`, `Defender`, `Goalkeeper`) in the API layer
- Normalised inconsistent BigQuery column types (integer, float, string) with `Number()` coercion and fallback defaults
- Generated deterministic form trend data from `Overall` ratings using a sine-wave function — same player always produces the same trend shape
- Pulled player photos, club crests (`Club Logo`), nationality flags (`Flag`), and country names (`Nationality`) from BigQuery and surfaced them across cards and detail headers

### 7. Security & Credential Management
- Navigated a **GCP Organisation Policy** (`iam.disableServiceAccountKeyCreation`) by using `gcloud auth application-default login` + `set-quota-project` instead of service account keys — a more secure, keyless approach
- Stored all secrets in `.env.local` (git-ignored), documented in `.env.example` with comments explaining each variable's purpose and GCP context
- Kept BigQuery credentials server-side only — the React frontend never touches GCP credentials directly

### 8. UX / Interface Design — Tailwind CSS & Framer Motion
- Designed a professional analytics dashboard with a fixed sidebar, sticky header, and responsive player grid
- Used **Framer Motion** (`AnimatePresence`, `motion.div`) for smooth player selection and comparison panel transitions
- Applied colour-coded dual-player theming: indigo for the primary subject, pink for the comparison — consistent across cards, headers, charts, and the AI panel
- Displayed club crests as photo overlays on player cards, and nationality flags inline with player detail info

---

## 🚀 Features

| Feature | Detail |
|---|---|
| **Live BigQuery Feed** | Queries `Player_Analyzer.Player_profiles` on demand — top 50 players by Overall rating, with search filtering pushed to SQL |
| **Player Search** | Real-time client-side filter across name, club, and position |
| **Club Crests & Flags** | Club logo overlaid on each player card; nationality flag shown in player detail header |
| **Percentile Bar Chart** | Horizontal bars comparing up to 2 players across 6 key metrics |
| **Tactical Radar** | Spider chart overlaying both players' skill profiles |
| **Form Trend Line** | Six-month rating trend per player |
| **Advanced Metrics Panel** | Side-by-side advanced stats table for primary vs comparison player |
| **AI Scouting Report** | Gemini 2.5 Flash generates: summary, head-to-head verdict, potential ceiling (rating + timeline + description), tactical fit (role + formations + description), strengths, and weaknesses |
| **Head-to-Head Mode** | Select two players — charts overlay, AI report switches to comparison mode automatically |
| **Comparison Insights** | Age gap and metric dominance score computed live |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Backend API** | Node.js, Express.js, TypeScript (`tsx`) |
| **Cloud Data Warehouse** | Google BigQuery (`@google-cloud/bigquery`) |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Data Visualisation** | Recharts (bar, radar, line) |
| **Styling** | Tailwind CSS 4, custom utility classes |
| **Animation** | Framer Motion |
| **Auth / Credentials** | GCP Application Default Credentials (`gcloud` ADC) |
| **Deployment** | Firebase Hosting |
| **Dataset** | FIFA 19 Complete Player Dataset — 18,207 players, 89 attributes |

---

## 📁 Project Structure

```
soccer-scouting-analytics/
├── server.ts                    # Express + BigQuery API server
├── src/
│   ├── App.tsx                  # Main React app (UI, state, charts)
│   ├── services/
│   │   ├── players.ts           # Player type + fetchPlayers() API client
│   │   └── gemini.ts            # Gemini AI — ScoutingReport type + prompt engine
│   └── lib/
│       └── utils.ts             # Tailwind cn() utility
├── public/
│   └── players.csv              # FIFA 19 dataset (reference copy)
├── .env.example                 # Documented env var template
├── .env.local                   # Secrets (git-ignored)
├── vite.config.ts               # Vite build + /api proxy config
├── firebase.json                # Firebase Hosting config
└── package.json
```

---

## ⚙️ Run Locally

**Prerequisites:** Node.js 18+, Google Cloud SDK (`gcloud`)

```bash
# 1. Clone the repo
git clone https://github.com/gabiyanu/soccer-scouting-analytics.git
cd soccer-scouting-analytics

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — set VITE_GEMINI_API_KEY and BigQuery vars

# 4. Authenticate with Google Cloud (no service account key needed)
gcloud auth application-default login
gcloud auth application-default set-quota-project player-profiles-analyzer

# 5. Terminal 1 — start the BigQuery API server
npm run server

# 6. Terminal 2 — start the Vite frontend
npm run dev
# → http://localhost:3000
```

Get a free Gemini API key at: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 📊 Dataset

The app queries the **FIFA 19 Complete Player Dataset** stored in BigQuery:

| Attribute | Value |
|---|---|
| Players | 18,207 |
| Attributes per player | 89 |
| Includes | Technical stats, physical ratings, club crests, nationality flags, player photos, contract values, wages, release clauses |
| Source | [Kaggle — FIFA 19 Complete Player Dataset](https://www.kaggle.com/datasets/javagarm/fifa-19-complete-player-dataset) |
| Storage | Google BigQuery — `player-profiles-analyzer.Player_Analyzer.Player_profiles` |

---

## 🧠 About the Developer

**Iyanuoluwa (Gabriel) Aboyeji**
Senior Modelling Specialist | Actuarial Analyst | Data Scientist

- 8+ years experience in data science, insurance analytics, and actuarial modelling
- Expertise in Python, R, SAS, SQL, and cloud data platforms
- Passionate about applying data science to real-world domains including sports analytics

📎 [GitHub](https://github.com/gabiyanu) · [LinkedIn](https://www.linkedin.com/in/gabrielaboyeji/)

---

## 📄 License

MIT License — feel free to fork and build on this project.
