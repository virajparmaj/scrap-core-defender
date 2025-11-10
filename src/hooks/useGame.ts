import { useState, useCallback } from "react";
import { GameConfig, BoardResponse, fetchPredict } from "@/lib/api";
import { getHighScore, saveHighScore } from "@/lib/storage";

export type GameState = "idle" | "loading" | "playing" | "gameover";

export interface TileState {
  revealed: boolean;
  isScrap: boolean;
}

/** ✅ Check if core is fully revealed using coreMask */
function isCoreFullyRevealed(tiles: TileState[][], coreMask: number[][]) {
  for (let r = 0; r < tiles.length; r++) {
    for (let c = 0; c < tiles[0].length; c++) {
      if (coreMask[r][c] === 1 && !tiles[r][c].revealed) return false;
    }
  }
  return true;
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
  const [coreMask, setCoreMask] = useState<number[][]>([]);

  /** ✅ turn order: core → noncore → core → … → free (after core cleared) */
  const [turnMode, setTurnMode] = useState<"core" | "noncore" | "free">("core");

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /** ✅ Start Game */
  const startGame = useCallback(async (newConfig: GameConfig) => {
    setGameState("loading");
    setError(null);

    // force square board
    const size = newConfig.rows;
    const fixedConfig = { ...newConfig, rows: size, cols: size };
    setConfig(fixedConfig);

    setScore(0);
    setTurnMode("core");

    const savedHighScore = getHighScore(fixedConfig);
    setHighScore(savedHighScore);

    try {
      const response: BoardResponse = await fetchPredict(fixedConfig);

      setBoard(response.board);
      setCoreMask(response.core); // ✅ backend core mask

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

  /** ✅ Reveal Tile Logic */
  const revealTile = useCallback(
    (row: number, col: number) => {
      if (gameState !== "playing") return;

      const inCore = coreMask[row]?.[col] === 1;

      // enforce turn rules unless free phase
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

        // ✅ Core complete → unlock full free-click
        if (isCoreFullyRevealed(newTiles, coreMask)) {
          setTurnMode("free");
        } else {
          // alternate core/noncore turns
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
    startGame,
    revealTile,
    resetGame,
  };
}