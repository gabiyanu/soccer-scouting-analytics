# ⚽ Soccer Scouting Analytics

> An AI-powered player scouting and analytics web application built with React, TypeScript, and Google Gemini — deployed on Firebase.

![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Deployed-Firebase-orange?style=flat-square&logo=firebase)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-green?style=flat-square&logo=google)
![Data](https://img.shields.io/badge/Dataset-FIFA%2019%20%7C%2018K%2B%20Players-red?style=flat-square)

---

## 🔗 Live Demo

👉 **[View Live App](https://soccer-scouting-app.web.app/)** 

---

## 📌 Project Overview

This project is a full-stack web application that enables data-driven soccer player scouting. It combines a rich FIFA 19 dataset of 18,000+ players with Google's Gemini AI to deliver intelligent player insights, comparisons, and recommendations — the kind of tool a real-world football analytics team might use.

Built as part of my **Data Science & Analytics Portfolio** to demonstrate skills in:
- Frontend development with modern React/TypeScript
- AI/LLM API integration (Google Gemini)
- Data wrangling and visualization at scale
- Cloud deployment (Firebase Hosting)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔍 **Player Search** | Search and filter across 18,000+ FIFA 19 players by name, club, position, and nationality |
| 📊 **Player Metrics** | View detailed stats including Overall, Potential, Pace, Dribbling, Shooting, and more |
| 🤖 **AI Scouting Reports** | Powered by Google Gemini — generates natural language scouting summaries for any player |
| ⚖️ **Player Comparison** | Side-by-side stat comparison across multiple players |
| 🌍 **Multi-attribute Filtering** | Filter by position, nationality, club, age range, and skill rating |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **AI** | Google Gemini API (via `@google/generative-ai`) |
| **Data** | FIFA 19 Player Dataset (CSV, 18,207 players) |
| **Styling** | CSS Modules |
| **Deployment** | Firebase Hosting (Google Cloud) |
| **Version Control** | Git + GitHub |

---

## 📁 Project Structure

```
soccer-scouting-analytics/
├── public/
│   └── players.csv          # FIFA 19 dataset (18K+ players)
├── src/
│   ├── components/          # React UI components
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Data processing helpers
├── .env.local               # API keys (not committed)
├── firebase.json            # Firebase hosting config
├── vite.config.ts           # Vite build config
└── package.json
```

---

## ⚙️ Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/gabiyanu/soccer-scouting-analytics.git
cd soccer-scouting-analytics

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
cp .env.example .env.local
# Edit .env.local and add: GEMINI_API_KEY=your_key_here

# 4. Start the dev server
npm run dev
```

Get a free Gemini API key at: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 📊 Dataset

The app uses the **FIFA 19 Complete Player Dataset** containing:
- **18,207 players** from top leagues worldwide
- **89 attributes** per player (technical, physical, mental stats)
- Player photos, club logos, nationality flags
- Contract values, wages, and release clauses

---

## 🧠 About the Developer

**Iyanuoluwa (Gabriel) Aboyeji**
Senior Modelling Specialist | Actuarial Analyst | Data Scientist

- 8+ years experience in data science, insurance analytics, and actuarial modelling
- Expertise in Python, R, SAS, SQL
- Passionate about applying data science to sports analytics

📎 [GitHub](https://github.com/gabiyanu) • [LinkedIn](https://www.linkedin.com/in/gabrielaboyeji/) *(update with your LinkedIn)*

---

## 📄 License

MIT License — feel free to fork and build on this project.
