import { useState, useCallback } from "react";
import { GameConfig, BoardResponse, fetchPredict } from "@/lib/api";
import { getHighScore, saveHighScore } from "@/lib/storage";

export type GameState = "idle" | "loading" | "playing" | "gameover";

export interface TileState {
  revealed: boolean;
  isScrap: boolean;
}

/** ✅ Check if ALL core cells are revealed */
function isCoreFullyRevealed(tiles: TileState[][], coreMask: boolean[][]) {
  for (let r = 0; r < tiles.length; r++) {
    for (let c = 0; c < tiles[0].length; c++) {
      if (coreMask[r][c] && !tiles[r][c].revealed) return false;
    }
  }
  return true;
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    rows: 7,
    powder: "Virgin",
    ta: false,
  });

  const [board, setBoard] = useState<number[][]>([]);
  const [tiles, setTiles] = useState<TileState[][]>([]);
  const [coreMask, setCoreMask] = useState<boolean[][]>([]); // ✅ boolean mask

  const [turnMode, setTurnMode] = useState<"core" | "noncore" | "free">("core");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /** ⏱ NEW: loading timer */
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  /** ✅ Start Game + Track Cold Start Delay */
  const startGame = useCallback(async (newConfig: GameConfig) => {
    setGameState("loading");
    setError(null);
    setLoadingSeconds(0);

    // ✅ Start visible counter
    let t = 0;
    const interval = setInterval(() => {
      t += 1;
      setLoadingSeconds(t);
    }, 1000);

    const size = newConfig.rows;
    const fixedConfig = { ...newConfig, rows: size, cols: size };
    setConfig(fixedConfig);

    setScore(0);
    setTurnMode("core");
    setHighScore(getHighScore(fixedConfig));

    try {
      const response: BoardResponse = await fetchPredict(fixedConfig);

      clearInterval(interval); // ✅ stop timer when API responds

      setBoard(response.board);

      // ✅ core mask to boolean[][]
      setCoreMask(response.core.map(row => row.map(v => v === 1)));

      const initialTiles = response.board.map(row =>
        row.map(cell => ({
          revealed: false,
          isScrap: cell === 1,
        }))
      );

      setTiles(initialTiles);
      setGameState("playing");
    } catch (err) {
      clearInterval(interval); // ✅ also stop timer on error
      setError(err instanceof Error ? err.message : "Failed to start game.");
      setGameState("idle");
    }
  }, []);

  /** ✅ Complete loading and enter gameplay */
const finishLoading = useCallback(
  (boardData: number[][], coreData: number[][]) => {
    setBoard(boardData);

    // coreData is numeric mask → convert to boolean mask
    setCoreMask(coreData.map(row => row.map(v => v === 1)));

    // create tiles array
    const initialTiles = boardData.map(row =>
      row.map(cell => ({
        revealed: false,
        isScrap: cell === 1,
      }))
    );

    setTiles(initialTiles);
    setGameState("playing");
  },
  []
);


  /** ✅ Reveal Logic */
  const revealTile = useCallback(
    (row: number, col: number) => {
      if (gameState !== "playing") return;

      const inCore = coreMask[row]?.[col];

      // turn sequencing (before core is fully revealed)
      if (turnMode === "core" && !inCore) return;
      if (turnMode === "noncore" && inCore) return;

      setTiles(prev => {
        if (prev[row][col].revealed) return prev;

        const newTiles = prev.map(r => [...r]);
        newTiles[row][col] = { ...newTiles[row][col], revealed: true };

        if (newTiles[row][col].isScrap) {
          setGameState("gameover");
          const finalScore = score;
          saveHighScore(config, finalScore);
          if (finalScore > highScore) setHighScore(finalScore);
          return newTiles;
        }

        setScore(s => s + 1);

        if (isCoreFullyRevealed(newTiles, coreMask)) {
          setTurnMode("free"); // ✅ unlocked
        } else {
          setTurnMode(prev => (prev === "core" ? "noncore" : "core"));
        }

        return newTiles;
      });
    },
    [gameState, coreMask, score, config, highScore, turnMode]
  );

  /** ✅ Reset */
  const resetGame = useCallback(() => {
    setGameState("idle");
    setBoard([]);
    setTiles([]);
    setCoreMask([]);
    setScore(0);
    setTurnMode("core");
    setError(null);
    setLoadingSeconds(0);
  }, []);

  return {
    gameState,
    config,
    board,
    tiles,
    coreMask,
    turnMode,
    score,
    highScore,
    error,
    loadingSeconds,        // <-- Include new timer
    startGame,
    finishLoading,         // <-- Make available to Index.tsx
    revealTile,
    resetGame,
  };
}