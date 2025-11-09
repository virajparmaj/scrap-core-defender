# scrap_infer.py
import numpy as np, pandas as pd, joblib

_MODEL = None

def load_model(path="artifacts/scrap_model_anygrid.joblib"):
    global _MODEL
    if _MODEL is None:
        _MODEL = joblib.load(path)
    return _MODEL


def _make_feature_frame(rows:int, cols:int, powder:str, ta:int):
    rr, cc = np.meshgrid(np.arange(rows), np.arange(cols), indexing="ij")
    r_scaled = rr/(rows-1 if rows>1 else 1)
    c_scaled = cc/(cols-1 if cols>1 else 1)
    dist_edge_min = np.minimum.reduce([r_scaled, c_scaled, 1-r_scaled, 1-c_scaled])
    dist_center   = np.sqrt((r_scaled-0.5)**2 + (c_scaled-0.5)**2)

    df = pd.DataFrame({
        "PowderPhase": powder,
        "r": r_scaled.ravel(),
        "c": c_scaled.ravel(),
        "dist_edge_min": dist_edge_min.ravel(),
        "dist_center":   dist_center.ravel(),
        "TA": int(ta),
    })
    return df


def predict_scrap_map(rows:int, cols:int, powder:str, ta:bool):
    """
    Return predicted scrap probability matrix P ∈ [0,1].
    """
    mdl = load_model()
    feats = _make_feature_frame(rows, cols, powder, int(ta))
    probs = mdl.predict_proba(feats)[:,1].reshape(rows, cols)
    return probs


# ------------------- NEW ADDITIONS -------------------

def boost_probs(P, min_rate=0.05):
    """
    Ensures the board has enough 'red' probability to be fun.
    min_rate = minimum average scrap probability.
    """
    mean_p = P.mean()
    if mean_p < min_rate:
        P = P * (min_rate / (mean_p + 1e-8))   # scale up overall difficulty
    P = np.clip(P, 0.001, 0.60)  # keep realistic
    return P


def sample_board_from_probs(P:np.ndarray, min_scraps=1, rng=None):
    """
    Draws a realistic board, guarantees at least `min_scraps` red tiles.
    """
    if rng is None:
        rng = np.random.default_rng()

    # Difficulty-adjust
    P = boost_probs(P)

    # Try up to 10 times to ensure we get >= min_scraps failures
    for _ in range(10):
        board = rng.binomial(1, P)
        if board.sum() >= min_scraps:
            return board.astype(int)

    # Fallback — set the most risky tile to scrap
    board = np.zeros_like(P, dtype=int)
    r, c = np.unravel_index(np.argmax(P), P.shape)
    board[r, c] = 1
    return board