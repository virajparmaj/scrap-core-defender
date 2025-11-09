from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from scrap_infer import predict_scrap_map

app = FastAPI()

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def core_window(rows: int, cols: int):
    """Calculate the safe core zone dimensions."""
    if rows >= 7 and cols >= 7:
        k = 3
    elif rows >= 5 and cols >= 5:
        k = 2
    else:
        k = 1
    r0 = rows // 2 - (k // 2)
    c0 = cols // 2 - (k // 2)
    return (r0, r0 + k, c0, c0 + k)

def sample_board_from_probs(P: np.ndarray, min_scraps: int = 1):
    """Sample a board ensuring at least min_scraps failures."""
    rng = np.random.default_rng()
    
    # Try up to 10 times
    for _ in range(10):
        board = rng.binomial(1, P)
        if board.sum() >= min_scraps:
            return board.astype(int)
    
    # Fallback - set highest probability tile to scrap
    board = np.zeros_like(P, dtype=int)
    r, c = np.unravel_index(np.argmax(P), P.shape)
    board[r, c] = 1
    return board

@app.get("/")
def root():
    return {"message": "Build Plate Survivor API", "status": "online"}

@app.get("/predict")
def predict(rows: int, cols: int, powder: str, ta: int):
    """Generate a game board based on parameters."""
    # Validate inputs
    if rows < 3 or cols < 3 or rows > 11 or cols > 11:
        raise HTTPException(400, "Grid dimensions must be between 3 and 11")
    
    if powder not in {"Virgin", "Recycled"}:
        raise HTTPException(400, "Powder must be 'Virgin' or 'Recycled'")
    
    if ta not in {0, 1}:
        raise HTTPException(400, "TA must be 0 or 1")
    
    # Get probability map from model
    P = predict_scrap_map(rows, cols, powder, bool(ta))
    
    # Apply safe core zone (zero probability)
    r0, r1, c0, c1 = core_window(rows, cols)
    P[r0:r1, c0:c1] = 0.0
    
    # Sample board with at least one scrap
    board = sample_board_from_probs(P, min_scraps=1)
    
    # Hard guarantee if randomness avoided all scraps
    if board.sum() == 0:
        mask = np.ones_like(P, dtype=bool)
        mask[r0:r1, c0:c1] = False
        rr, cc = np.where(mask)
        if len(rr) > 0:
            idx = np.argmax(P[rr, cc])
            board[rr[idx], cc[idx]] = 1
    
    return {
        "rows": rows,
        "cols": cols,
        "board": board.tolist(),
        "core": {"r0": int(r0), "r1": int(r1), "c0": int(c0), "c1": int(c1)}
    }
