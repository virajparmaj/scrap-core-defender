# Build Plate Survivor

A cyberpunk-themed Minesweeper-style training game powered by machine learning. Practice defect detection skills with dynamic board generation based on real manufacturing parameters.

## 🎮 Features

- **ML-Powered Board Generation**: Uses a pre-trained scikit-learn model to generate realistic scrap probability maps
- **Dynamic Difficulty**: Configure grid size (3×3 to 11×11), powder type, and thermal anneal settings
- **Core Mechanics**:
  - **Core Combo System**: Start in the safe center zone to activate score multipliers
  - **Overheat Timer**: Rotating unstable zones add temporal challenge
  - **High Score Tracking**: Per-configuration leaderboards saved locally
- **Cyberpunk Aesthetic**: Dark neon theme with GPU-optimized animations
- **Accessibility**: Respects `prefers-reduced-motion` settings

## 🚀 Getting Started

### Prerequisites

- **Frontend**: Node.js 18+ (with npm, yarn, or pnpm)
- **Backend**: Python 3.9+ with pip

### Installation

#### Frontend

```bash
# Install dependencies
pnpm install
# or: npm install / yarn install

# Start development server (default: localhost:5173)
pnpm dev
```

#### Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (default: localhost:8000)
uvicorn server:app --reload --port 8000
```

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8000
```

## 🏗️ Architecture

### Frontend (Vite + React + TypeScript)

```
src/
├── components/
│   ├── Grid.tsx              # Game board with tile animations
│   ├── HUD.tsx               # Score, multiplier, timer display
│   ├── Settings.tsx          # Game configuration
│   ├── TopBar.tsx            # Navigation and rules/scores
│   ├── Modal.tsx             # Rules and high scores dialogs
│   └── GameOverDialog.tsx    # End game results
├── hooks/
│   ├── useGame.ts            # Game state machine
│   └── useTimer.ts           # Overheat sector timer
├── lib/
│   ├── api.ts                # Backend API client
│   ├── labels.ts             # Grid coordinate labels
│   └── storage.ts            # LocalStorage high scores
└── pages/
    └── Index.tsx             # Main game page
```

### Backend (FastAPI + Python)

```
backend/
├── server.py                 # FastAPI endpoints
├── scrap_infer.py            # Model inference utilities
├── artifacts/
│   └── scrap_model_anygrid.joblib  # Pre-trained model
└── requirements.txt
```

## 🎯 Game Rules

1. **Setup**: Select grid size, powder type (Virgin/Recycled), and toggle Thermal Anneal
2. **Objective**: Reveal safe tiles without hitting scrap
3. **Tiles**:
   - 🟢 **Green** = Safe (+1 point, or +2 with multiplier)
   - 🔴 **Red** = Scrap (Game Over)
   - 🔵 **Core Zone** (outlined) = Always safe, activates combo
   - 🟠 **Amber Ring** = Unstable zone (rotates every 10s)
4. **Strategy**:
   - Click core tiles first to activate ×2 multiplier for next 4 reveals
   - Avoid unstable zones to maintain combo
   - Work outward from the safe center

## 🛠️ Build & Deploy

### Frontend

```bash
# Production build
pnpm build

# Preview production build
pnpm preview
```

Deploy to **Vercel** or **Netlify**:
- Connect GitHub repository
- Set build command: `pnpm build`
- Set output directory: `dist`
- Add environment variable: `VITE_API_URL=<your-backend-url>`

### Backend

Deploy to **Render** or **Railway**:

1. Create new Web Service
2. Connect repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Environment: Python 3.9+

## 📊 Model Details

The scrap prediction model uses:
- **Features**: Normalized position (r, c), distance to edge, distance to center, powder type, TA
- **Algorithm**: Scikit-learn classifier (details in `scrap_infer.py`)
- **Safe Core**: Guarantees a centered zone (1×1 to 3×3) with 0% scrap probability
- **Sampling**: Ensures at least 1 scrap tile per board for non-trivial gameplay

## 🎨 Design System

- **Colors**: Dark space blue (#0b0f1a) with cyan (#00E5FF), magenta (#FF47E1), lime (#B6FF3B) neon accents
- **Typography**: Inter (UI), JetBrains Mono (HUD/labels)
- **Animations**: GPU-optimized `transform` for tile reveals, respects `prefers-reduced-motion`

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Scrap prediction model trained on manufacturing process data
- Inspired by classic Minesweeper with modern ML twist
- Built with React, FastAPI, Tailwind CSS, and shadcn/ui

---

**Enjoy the game!** Master the core mechanics and climb the leaderboards. 🏆
