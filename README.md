# ⚽ Soccer Scouting Analytics Platform

> A production-deployed, AI-powered player scouting application connecting a live **Google BigQuery** data warehouse to a **React/TypeScript** frontend — with **Google Gemini 2.5 Flash** generating structured, comparison-driven scouting intelligence via a secure **Express.js backend**, containerised and deployed on **Google Cloud Run**.

![React](https://img.shields.io/badge/React_19-TypeScript-blue?style=flat-square&logo=react)
![BigQuery](https://img.shields.io/badge/Google-BigQuery-4285F4?style=flat-square&logo=googlebigquery)
![Express](https://img.shields.io/badge/Express.js-API_Server-black?style=flat-square&logo=express)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-34A853?style=flat-square&logo=google)
![Cloud Run](https://img.shields.io/badge/Deployed-Cloud_Run-4285F4?style=flat-square&logo=googlecloud)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker)
![Dataset](https://img.shields.io/badge/Dataset-FIFA_19_%7C_18K%2B_Players-red?style=flat-square)

---

## 🔗 Live Demo

👉 **[View Live App](https://soccer-scouting-api-783084248781.us-central1.run.app/)**

---

## 📌 Project Overview

This project is a production-deployed analytics platform for data-driven football scouting. It ingests a FIFA 19 dataset of 18,207 players from **Google BigQuery**, serves it through a **Node.js/Express REST API**, and visualises it in a responsive **React** dashboard — with **Google Gemini 2.5 Flash** generating expert-level, structured scouting reports on demand.

The architecture mirrors a real-world sports analytics stack: a cloud data warehouse feeding a containerised backend API, consumed by an interactive frontend with AI-generated insight layers. The entire system is deployed on **Google Cloud Run** with keyless IAM authentication — no credential files in the codebase. It was built end-to-end as part of my **Data Science & Analytics Portfolio** to demonstrate the full spectrum from data engineering to production cloud deployment.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                      │
│                                                               │
│   ┌─────────────────────────────────────┐                    │
│   │  BigQuery                           │                    │
│   │  player-profiles-analyzer           │                    │
│   │  └── Player_Analyzer               │                    │
│   │       └── Player_profiles (18K+)   │                    │
│   └──────────────┬──────────────────────┘                    │
│                  │  Parameterised SQL (ADC / IAM)             │
│   ┌──────────────▼──────────────────────────────────────┐    │
│   │  Cloud Run — Docker Container                       │    │
│   │                                                     │    │
│   │  Express.js API Server (TypeScript / tsx)           │    │
│   │  ├── GET  /api/players      ← BigQuery queries      │    │
│   │  ├── POST /api/scouting-report ← Gemini 2.5 Flash   │    │
│   │  ├── GET  /api/health                               │    │
│   │  └── Serves built React frontend (static files)    │    │
│   └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │  Single public URL
          ┌────────────────▼──────────────────────┐
          │  React 19 + TypeScript (Vite)         │
          │  ├── Player grid  (live BQ data)      │
          │  ├── Stat charts  (Recharts)           │
          │  └── AI panel     (Gemini via /api)   │
          └───────────────────────────────────────┘
```

---

## 🧠 Skills Demonstrated

### 1. Cloud Data Engineering — Google BigQuery
- Designed and queried a BigQuery dataset (`Player_Analyzer.Player_profiles`) using **parameterised Standard SQL** with backtick-quoted column names and dynamic `WHERE` clauses for server-side filtering
- Pushed filtering by position and name/club search directly to SQL — avoiding unnecessary data transfer from the warehouse
- Managed **Application Default Credentials (ADC)** via `gcloud auth application-default` and `set-quota-project` — fully keyless authentication
- Navigated a **GCP Organisation Policy** (`iam.disableServiceAccountKeyCreation`) by adopting ADC as a more secure alternative to service account JSON keys
- Handled real-world BigQuery schema quirks: space-containing column names (`` `Club Logo` ``, `` `Club` ``), mixed integer/float/string types, and reserved word quoting

### 2. Backend API Development — Node.js / Express / TypeScript
- Built a production Express.js REST API (`server.ts`) in TypeScript, executed via `tsx` with no compilation step required
- Integrated `@google-cloud/bigquery` with project/dataset/table configuration through environment variables for full portability
- Added a `/api/scouting-report` POST endpoint that calls **Gemini 2.5 Flash** server-side — keeping the AI API key secure and out of the browser bundle entirely
- Designed the server to serve the built React frontend as static files, making the entire app a single deployable unit
- Loaded `.env.local` via `dotenv` with explicit path resolution, cleanly separated from the Vite frontend environment

### 3. Cloud Deployment & Containerisation — Docker + Google Cloud Run
- Wrote a multi-stage `Dockerfile` that installs dependencies, builds the React frontend, and serves both the API and static files from a single container
- Configured `cloudbuild.yaml` to use the `gcr.io/cloud-builders/docker` builder, bypassing Cloud Build's language auto-detection which incorrectly identified the project as Python
- Deployed to **Google Cloud Run** using `gcloud run deploy --source .` with Cloud Build handling image creation and Artifact Registry storage
- Granted the Cloud Run compute service account `BigQuery Data Viewer` and `BigQuery Job User` IAM roles — enabling keyless BigQuery access from the container without any credential files
- Set runtime environment variables (`BIGQUERY_PROJECT_ID`, `GEMINI_API_KEY`) directly on the Cloud Run service, keeping secrets out of the Docker image and source code

### 4. AI / LLM Integration — Google Gemini 2.5 Flash
- Integrated **Google Gemini 2.5 Flash** via `@google/genai` with **structured JSON output** enforced through a typed response schema (`responseMimeType: "application/json"`)
- Moved Gemini from client-side to **server-side** — the API key is never exposed in the browser bundle, following security best practices for LLM integrations
- Engineered dynamic prompts that switch between **single-player analysis** and **head-to-head comparison** modes automatically based on whether a comparison player is selected
- Defined a rich 12-field `ScoutingReport` schema covering `potentialRating`, `potentialTimeline`, `potentialDescription`, `bestFormations`, `idealRole`, `tacticalDescription`, `comparisonVerdict`, and `keyDifference`
- Handled model deprecation (migrated from `gemini-2.0-flash` to `gemini-2.5-flash`) and surfaced null/empty response errors clearly in the UI

### 5. Frontend Engineering — React 19 / TypeScript / Vite
- Architected a modular React app with clean separation of concerns: data fetching (`services/players.ts`), AI (`services/gemini.ts`), and UI (`App.tsx`)
- Used `useEffect`, `useState`, `useMemo`, and `useCallback` to manage async BigQuery data loading, client-side search/filter, and derived chart data efficiently
- Configured a **Vite dev proxy** to forward `/api` requests to the local Express backend, enabling seamless local development without CORS issues
- Implemented comprehensive loading, error, and empty states — users always see meaningful feedback on the status of backend connections

### 6. Data Visualisation — Recharts
- Built three interactive chart types from live BigQuery player stats: **vertical bar chart** (percentile comparisons), **radar chart** (tactical skill profile), and **line chart** (form trend over time)
- Wired all charts to support **dual-player overlay** — primary player in indigo, comparison player in pink — with a single shared data model
- Used `useMemo` for all chart data derivations to prevent unnecessary re-renders when browsing large player lists

### 7. Data Pipeline & Transformation
- Mapped raw FIFA abbreviated positions (`ST`, `CDM`, `LCB`, `GK`, etc.) to readable labels (`Forward`, `Midfielder`, `Defender`, `Goalkeeper`) in the API layer
- Normalised inconsistent BigQuery column types (integer, float, string) with `Number()` coercion and safe fallback defaults throughout
- Generated deterministic form trend data from `Overall` ratings using a sine-wave function — same player always produces the same plausible trend shape
- Surfaced player photos, club crests (`Club Logo`), nationality flags (`Flag`), and country names (`Nationality`) from BigQuery, displayed across player cards and detail headers

### 8. Security & Credential Management
- Applied a **defence-in-depth** approach to secrets: `.env.local` git-ignored locally, Cloud Run environment variables in production, no secrets in Docker images or source code
- Moved the Gemini AI API key from the frontend (where it would be exposed in the browser) to the Express backend, accessed only at runtime on the server
- Granted least-privilege IAM roles to the Cloud Run service account — `bigquery.dataViewer` and `bigquery.jobUser` only
- Documented all environment variables in `.env.example` with comments explaining GCP context and how to obtain each value

### 9. UX / Interface Design — Tailwind CSS & Framer Motion
- Designed a professional analytics dashboard with a fixed sidebar, sticky header, and responsive player grid
- Used **Framer Motion** (`AnimatePresence`, `motion.div`) for smooth player selection and comparison panel transitions
- Applied consistent dual-player colour theming (indigo / pink) across cards, headers, charts, and the AI panel
- Rendered rich AI report cards — amber verdict, indigo potential, pink tactical fit — with colour-coded strengths and weaknesses grids

---

## 🚀 Features

| Feature | Detail |
|---|---|
| **Live BigQuery Feed** | Queries `Player_Analyzer.Player_profiles` on demand — shows top 50 players by Overall rating, with search filtering  for other players pushed to SQL |
| **Player Search** | Real-time client-side filter across name, club, and position |
| **Club Crests & Flags** | Club logo overlaid on each player card; nationality flag in player detail header |
| **Percentile Bar Chart** | Horizontal bars comparing up to 2 players across 6 key metrics |
| **Tactical Radar** | Spider chart overlaying both players' skill profiles |
| **Form Trend Line** | Six-month rating trend per player |
| **Advanced Metrics Panel** | Side-by-side advanced stats table for primary vs comparison player |
| **AI Scouting Report** | Gemini 2.5 Flash (server-side) generates: summary, head-to-head verdict, potential ceiling, tactical fit, strengths, and weaknesses |
| **Head-to-Head Mode** | Select two players — charts overlay, AI report switches to comparison mode automatically |
| **Containerised Deployment** | Single Docker image serves both API and frontend from Google Cloud Run |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Backend API** | Node.js, Express.js, TypeScript (`tsx`) |
| **Cloud Data Warehouse** | Google BigQuery (`@google-cloud/bigquery`) |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/genai`) — server-side |
| **Data Visualisation** | Recharts (bar, radar, line) |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Containerisation** | Docker, Google Cloud Build, Artifact Registry |
| **Deployment** | Google Cloud Run (auto-scaling, keyless IAM) |
| **Auth / Credentials** | GCP Application Default Credentials (ADC) |
| **Dataset** | FIFA 19 Complete Player Dataset — 18,207 players, 89 attributes |

---

## 📁 Project Structure

```
soccer-scouting-analytics/
├── server.ts                    # Express API: BigQuery + Gemini + static serving
├── Dockerfile                   # Container definition (build + serve)
├── cloudbuild.yaml              # Cloud Build config (Docker-based)
├── src/
│   ├── App.tsx                  # Main React app (UI, state, charts)
│   ├── services/
│   │   ├── players.ts           # Player type + fetchPlayers() API client
│   │   └── gemini.ts            # Scouting report type + /api/scouting-report client
│   └── lib/
│       └── utils.ts             # Tailwind cn() utility
├── public/
│   └── players.csv              # FIFA 19 dataset (reference copy)
├── .env.example                 # Documented env var template
├── .env.local                   # Secrets (git-ignored)
├── .dockerignore                # Excludes secrets and build artefacts from image
├── vite.config.ts               # Vite build + /api dev proxy config
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
# Edit .env.local — set GEMINI_API_KEY and BigQuery vars

# 4. Authenticate with Google Cloud (no service account key needed)
gcloud auth application-default login
gcloud auth application-default set-quota-project player-profiles-analyzer

# 5. Terminal 1 — start the BigQuery + Gemini API server
npm run server

# 6. Terminal 2 — start the Vite frontend
npm run dev
# → http://localhost:3000
```

Get a free Gemini API key at: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## ☁️ Deploy to Cloud Run

```bash
# 1. Set active project
gcloud config set project player-profiles-analyzer

# 2. Build and deploy
gcloud run deploy soccer-scouting-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# 3. Set runtime environment variables
gcloud run services update soccer-scouting-api \
  --region us-central1 \
  --set-env-vars BIGQUERY_PROJECT_ID=player-profiles-analyzer,\
BIGQUERY_DATASET=Player_Analyzer,\
BIGQUERY_TABLE=Player_profiles,\
GEMINI_API_KEY=your-key-here

# 4. Grant BigQuery access to the Cloud Run service account
gcloud projects add-iam-policy-binding player-profiles-analyzer \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding player-profiles-analyzer \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

---

## 📊 Dataset

The app queries the **FIFA 19 Complete Player Dataset** stored in Google BigQuery:

| Attribute | Value |
|---|---|
| Players | 18,207 |
| Attributes per player | 89 |
| Includes | Technical stats, physical ratings, club crests, nationality flags, player photos, wages, release clauses |
| Source | [Kaggle — FIFA 19 Complete Player Dataset](https://www.kaggle.com/datasets/javagarm/fifa-19-complete-player-dataset) |
| Storage | `player-profiles-analyzer.Player_Analyzer.Player_profiles` |

---

## 🧠 About the Developer

**Iyanuoluwa (Gabriel) Aboyeji**
Modelling Specialist | Actuarial Analyst | Data Scientist

- 8+ years experience in data science, insurance analytics, and actuarial modelling
- Expertise in Python, R, SAS, SQL, and cloud data platforms
- Passionate about applying data science to real-world domains including sports analytics

📎 [GitHub](https://github.com/gabiyanu) · [LinkedIn](https://www.linkedin.com/in/gabrielaboyeji/)

---

## 📄 License

MIT License — feel free to fork and build on this project.
