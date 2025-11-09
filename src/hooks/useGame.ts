import { useState, useCallback } from "react";
import { GameConfig, BoardResponse, fetchPredict } from "@/lib/api";
import { getHighScore, saveHighScore } from "@/lib/storage";

export type GameState = "idle" | "loading" | "playing" | "gameover";

export interface TileState {
  revealed: boolean;
  isScrap: boolean;
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
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierRemaining, setMultiplierRemaining] = useState(0);
  const [coreClicked, setCoreClicked] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startGame = useCallback(async (newConfig: GameConfig) => {
    setGameState("loading");
    setError(null);
    setConfig(newConfig);
    setScore(0);
    setMultiplier(1);
    setMultiplierRemaining(0);
    setCoreClicked(false);
    
    const currentHighScore = getHighScore(newConfig);
    setHighScore(currentHighScore);

    try {
      const response: BoardResponse = await fetchPredict(newConfig);
      setBoard(response.board);
      setCoreZone(response.core);
      
      // Initialize all tiles as hidden
      const initialTiles: TileState[][] = response.board.map(row =>
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

  const revealTile = useCallback((row: number, col: number) => {
    if (gameState !== "playing") return;

    setTiles(prev => {
      if (prev[row][col].revealed) return prev;

      const newTiles = prev.map(r => [...r]);
      newTiles[row][col] = { ...newTiles[row][col], revealed: true };

      const isScrap = newTiles[row][col].isScrap;
      const isInCore = row >= coreZone.r0 && row < coreZone.r1 && 
                       col >= coreZone.c0 && col < coreZone.c1;

      if (isScrap) {
        setGameState("gameover");
        const finalScore = score;
        saveHighScore(config, finalScore);
        if (finalScore > highScore) {
          setHighScore(finalScore);
        }
      } else {
        // Safe tile
        let points = 1;
        
        if (isInCore && !coreClicked) {
          // First core click - activate multiplier
          setCoreClicked(true);
          setMultiplier(2);
          setMultiplierRemaining(4);
        } else if (!isInCore && multiplierRemaining > 0) {
          // Outside core with active multiplier
          points = 2;
          setMultiplierRemaining(prev => prev - 1);
          if (multiplierRemaining === 1) {
            setMultiplier(1);
          }
        }
        
        setScore(prev => prev + points);
      }

      return newTiles;
    });
  }, [gameState, coreZone, score, config, highScore, coreClicked, multiplierRemaining]);

  const resetGame = useCallback(() => {
    setGameState("idle");
    setBoard([]);
    setTiles([]);
    setScore(0);
    setMultiplier(1);
    setMultiplierRemaining(0);
    setCoreClicked(false);
    setError(null);
  }, []);

  return {
    gameState,
    config,
    board,
    tiles,
    coreZone,
    score,
    multiplier,
    multiplierRemaining,
    highScore,
    error,
    startGame,
    revealTile,
    resetGame,
  };
}
