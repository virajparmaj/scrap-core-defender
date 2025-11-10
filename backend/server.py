# backend/server.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np

# Ensure model lookup path
os.environ.setdefault(
    "ARTIFACT_PATH",
    os.path.join(os.path.dirname(__file__), "artifacts", "scrap_model_anygrid.joblib"),
)

from scrap_infer import predict_scrap_map  # noqa: E402

app = FastAPI(title="Build Plate Survivor API")

# --- CORS ---
ALLOW_ORIGINS = os.getenv("ALLOW_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health ---
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "Build Plate Survivor API", "status": "online"}


# ========= Helpers =========

def _sigmoid(x): return 1 / (1 + np.exp(-x))
def _logit(p):
    p = np.clip(p, 1e-9, 1-1e-9)
    return np.log(p/(1-p))

def core_window(rows: int, cols: int):
    """
    Select core zone based on grid size:
      3x3  → 1x1
      4x4  → 2x2
      5x5  → 3x3
      6x6, 7x7  → 4x4
      8x8+ → 6x6 (up to 11x11 max board size)
    """
    n = min(rows, cols)

    if n <= 3:
        k = 1
    elif n == 4:
        k = 2
    elif n == 5:
        k = 3
    elif n in (6, 7):
        k = 4
    else:
        k = 6  # applies to 8,9,10,11

    # Center the core
    r0 = (rows - k) // 2
    c0 = (cols - k) // 2
    r1 = r0 + k
    c1 = c0 + k

    mask = np.zeros((rows, cols), dtype=bool)
    mask[r0:r1, c0:c1] = True
    return mask

def random_spatial_transform(P):
    """
    Apply a random flip/rotation to break deterministic scrap placement,
    while preserving relative spatial probability structure.
    """
    rng = np.random.default_rng()
    choice = rng.integers(0, 6)

    if choice == 0:
        return P
    elif choice == 1:
        return np.rot90(P, 1)
    elif choice == 2:
        return np.rot90(P, 2)
    elif choice == 3:
        return np.rot90(P, 3)
    elif choice == 4:
        return np.flipud(P)
    elif choice == 5:
        return np.fliplr(P)


def sample_with_weighted_target(P, base_target=0.33, temperature=1.8, min_scraps=None):
    """
    Preserve model shape; boost only non-core density.
    - Core stays unmodified (no sharpening, no forcing).
    - Target rate applies to NON-CORE area.
    """
    eps = 1e-6
    P = np.clip(P, eps, 1-eps)
    rows, cols = P.shape

    core = core_window(rows, cols)
    noncore = ~core
    noncore_count = int(noncore.sum())
    if noncore_count == 0:
        # Degenerate tiny boards: just sample directly
        rng = np.random.default_rng()
        return rng.binomial(1, P).astype(int), False

    # Temperature sharpening only on non-core
    Pt = P.copy()
    Pt[noncore] = np.clip(P[noncore] ** (1/temperature), eps, 1-eps)
    # Core remains as original probabilities
    Pt[core] = P[core]

    # Compute target scrap rate on NON-CORE region (1/4 = ~0.25 baseline)
    mean_p_nc = float(P[noncore].mean())

    if rows * cols <= 16:
        # Small boards → lower rate to keep the game playable
        target_nc = 0.15
    elif rows * cols <= 36:
        # Medium boards → your desired 1/4th scrap
        target_nc = 0.25
    else:
        # Large boards → slightly more scrap to increase difficulty
        target_nc = 0.30

    # Blend with model probability (keeps realism)
    target_nc = 0.6 * target_nc + 0.4 * mean_p_nc

    # Ensure stable boundaries
    target_nc = float(np.clip(target_nc, 0.10, 0.45))

    # Logit shift to hit target on non-core only
    L = _logit(Pt)
    lo, hi = -8.0, 8.0
    for _ in range(30):
        shift = (lo + hi) / 2
        adj = _sigmoid(L + shift)
        m = float(adj[noncore].mean())
        if m < target_nc:
            lo = shift
        else:
            hi = shift
    Padj = _sigmoid(L + (lo + hi) / 2)

    # Guard: NEVER boost core above its original P
    Padj[core] = np.minimum(Padj[core], P[core])

    # Sample
    rng = np.random.default_rng()
    B = rng.binomial(1, Padj).astype(int)

    # Ensure minimum scraps on NON-CORE only
    need_nc = int(np.ceil(target_nc * noncore_count))
    if min_scraps is not None:
        need_nc = max(need_nc, int(min_scraps))

    have_nc = int(B[noncore].sum())
    if have_nc < need_nc:
        # Force top-(need_nc - have_nc) non-core cells by probability
        deficit = need_nc - have_nc
        flat_idx = np.flatnonzero(noncore.ravel())
        probs_nc = Padj.ravel()[flat_idx]
        order = np.argsort(probs_nc)[::-1]
        to_flip = flat_idx[order[:deficit]]
        B_flat = B.ravel()
        B_flat[to_flip] = 1
        B = B_flat.reshape(rows, cols)

    # Core stays as sampled; we never force core to 1
    return B, False


# ========= Predict =========

@app.get("/predict")
def predict(
    rows: int = Query(..., ge=3, le=11),
    cols: int = Query(..., ge=3, le=11),
    powder: str = Query(..., pattern="^(Virgin|Recycled)$"),
    ta: int = Query(..., ge=0, le=1),
    minScraps: int = Query(1, alias="minScraps", ge=0),
    temperature: float = Query(1.8, gt=0.1, le=10.0),
    targetRate: float = Query(0.33, gt=0.05, le=0.75),
):
    try:
        P = predict_scrap_map(rows, cols, powder, bool(ta))
        P = random_spatial_transform(P)   # NEW: introduce pattern variability
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Model missing: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"inference_error: {e}")

    board, forced = sample_with_weighted_target(
        P, base_target=targetRate, temperature=temperature, min_scraps=minScraps
    )

    return {
        "rows": rows,
        "cols": cols,
        "powder": powder,
        "ta": ta,
        "board": board.tolist(),
        "mean_prob": float(np.mean(P)),
        "forced": forced,
        "effective_target_rate_noncore": targetRate,
    }