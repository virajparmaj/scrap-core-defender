import { useState, useCallback } from "react";
import { GameConfig, BoardResponse, fetchPredict } from "@/lib/api";
import { getHighScore, saveHighScore } from "@/lib/storage";

export type GameState = "idle" | "loading" | "playing" | "gameover";

export interface TileState {
  revealed: boolean;
  isScrap: boolean;
}

/** ✅ Check if core is fully revealed */
function isCoreFullyRevealed(
  tiles: TileState[][],
  core: { r0: number; r1: number; c0: number; c1: number }
) {
  for (let r = core.r0; r < core.r1; r++) {
    for (let c = core.c0; c < core.c1; c++) {
      if (!tiles[r][c].revealed) return false;
    }
  }
  return true;
}

/** ✅ New Correct Core Size Rule */
function computeCore(rows: number, cols: number) {
  const k = Math.floor(Math.min(rows, cols) / 2);
  const r0 = Math.floor((rows - k) / 2);
  const c0 = Math.floor((cols - k) / 2);
  return { r0, r1: r0 + k, c0, c1: c0 + k };
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    rows: 7,
    cols: 7,
    powder: "Virgin",
    ta: false,
  });

  const [board, setBoard] = useState<number[][]>([]);
  const [tiles, setTiles] = useState<TileState[][]>([]);
  const [coreZone, setCoreZone] = useState({ r0: 0, r1: 0, c0: 0, c1: 0 });

  /** ✅ turn mode: "core" → "noncore" → ... → "free" */
  const [turnMode, setTurnMode] = useState<"core" | "noncore" | "free">("core");

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startGame = useCallback(async (newConfig: GameConfig) => {
    setGameState("loading");
    setError(null);

    const size = newConfig.rows; // enforce square
    const fixedConfig = { ...newConfig, rows: size, cols: size };
    setConfig(fixedConfig);

    setScore(0);
    setTurnMode("core");

    const currentHighScore = getHighScore(fixedConfig);
    setHighScore(currentHighScore);

    try {
      const response: BoardResponse = await fetchPredict(fixedConfig);
      setBoard(response.board);

      /** ✅ Correct core ALWAYS computed */
      setCoreZone(computeCore(size, size));

      const initialTiles = response.board.map(row =>
        row.map(cell => ({
          revealed: false,
          isScrap: cell === 1,
        }))
      );

      setTiles(initialTiles);
      setGameState("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
      setGameState("idle");
    }
  }, []);

  const revealTile = useCallback(
    (row: number, col: number) => {
      if (gameState !== "playing") return;

      const inCore =
        row >= coreZone.r0 &&
        row < coreZone.r1 &&
        col >= coreZone.c0 &&
        col < coreZone.c1;

      // ✅ Turn enforcement (disabled after core cleared)
      if (turnMode === "core" && !inCore) return;
      if (turnMode === "noncore" && inCore) return;

      setTiles(prev => {
        if (prev[row][col].revealed) return prev;

        const newTiles = prev.map(r => [...r]);
        newTiles[row][col] = { ...newTiles[row][col], revealed: true };

        const isScrap = newTiles[row][col].isScrap;

        if (isScrap) {
          setGameState("gameover");
          const finalScore = score;
          saveHighScore(config, finalScore);
          if (finalScore > highScore) setHighScore(finalScore);
          return newTiles;
        }

        setScore(prev => prev + 1);

        // ✅ Check if core completed → unlock free mode
        if (isCoreFullyRevealed(newTiles, coreZone)) {
          setTurnMode("free");
        } else {
          // Alternate turn: core → noncore → core → …
          setTurnMode(prev => (prev === "core" ? "noncore" : "core"));
        }

        return newTiles;
      });
    },
    [gameState, coreZone, score, config, highScore, turnMode]
  );

  const resetGame = useCallback(() => {
    setGameState("idle");
    setBoard([]);
    setTiles([]);
    setScore(0);
    setTurnMode("core");
    setError(null);
  }, []);

  return {
    gameState,
    config,
    board,
    tiles,
    coreZone,
    turnMode,
    score,
    highScore,
    error,
    startGame,
    revealTile,
    resetGame,
  };
}