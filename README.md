Here’s a polished, professional **`README.md`** you can use for your hosted site **Build Plate Survivor**, integrating your backend (Render) and frontend (Vercel) setup:

---

# 🧩 Build Plate Survivor

**ML-Powered Defect Training Game**

[🌐 Live Site](https://build-plate-survivor.vercel.app) • [⚙️ Backend API (Render)](https://scrap-core-defender.onrender.com)

---

## 🚀 Overview

**Build Plate Survivor** is a cyberpunk-inspired, ML-powered Minesweeper-style game that trains users to identify *safe* and *defective* build plate zones.
The game connects to a lightweight ML inference API hosted on Render, which predicts grid configurations dynamically.

This project demonstrates:

* Client–server integration across Vercel and Render
* Real-time model-driven gameplay
* Engaging data visualization for manufacturing analytics

---

## 🎮 Gameplay Summary

**Objective**
Reveal as many *safe tiles* as possible without hitting scrap.
Each safe tile increases your score.

**Tile Types**

| Color                   | Meaning                      | Points |
| ----------------------- | ---------------------------- | ------ |
| 🟩 Green                | Safe tile                    | +1     |
| 🟥 Red                  | Scrap (Game Over)            | 0      |
| 🔵 Outlined (Core Zone) | Always safe                  | +1     |
| 🟠 Amber Ring           | Unstable (rotates every 10s) | varies |

**Core Mechanics**

* **Core Combo:** Click a core tile first → activates ×2 multiplier for 4 turns.
* **Overheat Timer:** Amber zones shift every 10s.
* **Full Reveal:** On game over, all tiles are revealed (so players can learn from mistakes).

---

## ⚙️ Tech Stack

**Frontend** — deployed on **Vercel**

* React + TypeScript + Vite
* TailwindCSS + shadcn/ui + lucide-react
* State hooks for live game logic
* Dynamic loader + Render cold-start countdown

**Backend** — deployed on **Render**

* FastAPI (Python)
* Joblib model inference (`scrap_model_anygrid.joblib`)
* `/predict` endpoint returning `board` + `core` masks
* Cold-start delay handled with frontend loading timer

---

## 🧠 Features

* 🔄 Real-time API integration
* 🧱 Adjustable grid size (3×3 → 11×11)
* 🧬 Powder Type: *Virgin* / *Recycled*
* 🧪 Optional “Test Artifacts (TA)” toggle
* 🔥 Animated loading state with countdown (for Render cold start)
* 🏆 Persistent high-score system (per configuration)
* 🧩 Visual reveal of all scrap/safe tiles post-game

---

## 🧭 Deployment Flow

| Component     | Platform                             | URL / Command                                                                |
| ------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| Frontend      | **Vercel**                           | [build-plate-survivor.vercel.app](https://build-plate-survivor.vercel.app)   |
| Backend       | **Render**                           | [scrap-core-defender.onrender.com](https://scrap-core-defender.onrender.com) |
| Build Command | `npm install && npm run build`       |                                                                              |
| Start Command | `yarn start`                         |                                                                              |
| Instance Type | Render Free Tier (cold start 45–60s) |                                                                              |

> **Note:** Free Render instances spin down after inactivity — the game displays a warming-up message with a live countdown during startup.

---

## 🧩 Project Structure

```
scrap-core-defender/
├── backend/
│   ├── server.py              # FastAPI app
│   ├── scrap_infer.py         # ML inference logic
│   └── artifacts/
│       └── scrap_model_anygrid.joblib
├── src/
│   ├── components/            # React components
│   ├── hooks/                 # useGame, useTimer
│   ├── pages/                 # index.tsx (main UI)
│   └── lib/                   # API + storage utilities
├── public/
│   └── favicon.ico
└── README.md
```

---

## 💡 Development Setup

```bash
# Clone repository
git clone https://github.com/virajparmaj/scrap-core-defender.git
cd scrap-core-defender

# Install dependencies
npm install

# Run locally
npm run dev

# Backend (Python 3.10+)
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:8000`

---

## 📈 Future Enhancements

* 🔊 Sound effects and haptics
* 🌐 Multiplayer high-score leaderboard
* 🧩 Adaptive ML-based difficulty
* 📊 Admin dashboard for analytics

---

## 👨‍💻 Author

**Viraj Parmaj**
🎓 M.S. in Statistics @ UIUC
📍 Data Science • Machine Learning • Embedded AI
🔗 [GitHub](https://github.com/virajparmaj) | [LinkedIn](https://linkedin.com/in/virajparmaj)