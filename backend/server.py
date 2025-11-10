# backend/server.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pathlib import Path
import joblib

from scrap_infer import predict_scrap_map

# -----------------------------
# Model Load Check
# -----------------------------
MODEL_PATH = Path(__file__).parent / "artifacts" / "scrap_model_anygrid.joblib"
if MODEL_PATH.exists():
    print(f"✅ Model found → {MODEL_PATH}")
else:
    print(f"❌ Model NOT found at {MODEL_PATH}")

# -----------------------------
# App Setup
# -----------------------------
app = FastAPI(title="Build Plate Survivor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow everything (frontend deployment safe)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Utility Functions
# -----------------------------
def _sigmoid(x): return 1 / (1 + np.exp(-x))

def _logit(p):
    p = np.clip(p, 1e-9, 1 - 1e-9)
    return np.log(p / (1 - p))

def core_window(rows: int, cols: int):
    """Generate boolean mask defining safe core region."""
    n = min(rows, cols)

    # Core size rule (your scaling table preserved)
    table = {3:1, 4:2, 5:3, 6:4, 7:3, 8:6, 9:5, 10:6, 11:7}
    k = table.get(n, max(1, (n // 2) | 1))

    r0 = (rows - k) // 2
    c0 = (cols - k) // 2

    mask = np.zeros((rows, cols), dtype=bool)
    mask[r0:r0+k, c0:c0+k] = True
    return mask

def random_spatial_transform(P):
    """Random flip/rotate to avoid repeat boards."""
    rng = np.random.default_rng()
    ops = [
        lambda x: x,
        lambda x: np.rot90(x, 1),
        lambda x: np.rot90(x, 2),
        lambda x: np.rot90(x, 3),
        lambda x: np.flipud(x),
        lambda x: np.fliplr(x),
    ]
    return ops[rng.integers(0, 6)](P)

def sample_with_weighted_target(P, temperature=1.8, min_scraps=None):
    """Sampling logic preserved exactly."""
    eps = 1e-6
    P = np.clip(P, eps, 1-eps)
    rows, cols = P.shape

    core = core_window(rows, cols)
    noncore = ~core
    noncore_count = int(noncore.sum())

    # Temperature sharpen non-core probabilities only
    Pt = P.copy()
    Pt[noncore] = np.clip(P[noncore] ** (1/temperature), eps, 1-eps)

    mean_nc = float(P[noncore].mean())
    target_nc = [0.15, 0.25, 0.30][
        0 if rows*cols <= 16 else 1 if rows*cols <= 36 else 2
    ]
    target_nc = float(np.clip(0.6*target_nc + 0.4*mean_nc, 0.10, 0.45))

    L = _logit(Pt)
    lo, hi = -8, 8
    for _ in range(30):
        shift = (lo + hi) / 2
        adj = _sigmoid(L + shift)
        m = float(adj[noncore].mean())
        if m < target_nc: lo = shift
        else: hi = shift
    Padj = _sigmoid(L + (lo + hi) / 2)

    # NEVER increase scrap probability inside core
    Padj[core] = np.minimum(Padj[core], P[core])

    rng = np.random.default_rng()
    B = rng.binomial(1, Padj).astype(int)

    # Ensure minimum non-core scraps
    if min_scraps:
        need = max(int(target_nc * noncore_count), min_scraps)
        have = int(B[noncore].sum())
        if have < need:
            diff = need - have
            idx_nc = np.flatnonzero(noncore.ravel())
            probs = Padj.ravel()[idx_nc]
            to_set = idx_nc[np.argsort(probs)[::-1][:diff]]
            B.ravel()[to_set] = 1

    return B, False

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/health")
def health(): return {"ok": True}

@app.get("/")
def root(): return {"message": "Build Plate Survivor API", "status": "online"}

@app.get("/predict")
def predict(
    rows: int = Query(..., ge=3, le=11),
    cols: int = Query(..., ge=3, le=11),
    powder: str = Query(..., pattern="^(Virgin|Recycled)$"),
    ta: int = Query(..., ge=0, le=1),
):
    try:
        P = predict_scrap_map(rows, cols, powder, bool(ta))
        P = random_spatial_transform(P)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"inference_error: {e}")

    board, forced = sample_with_weighted_target(P)

    core_mask = core_window(rows, cols).astype(int)

    return {
        "rows": rows,
        "cols": cols,
        "powder": powder,
        "ta": ta,
        "board": board.tolist(),
        "core": core_mask.tolist(),        # ✅ ALWAYS INCLUDED
        "forced": forced,
        "mean_prob": float(np.mean(P)),
    }