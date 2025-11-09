import { GameConfig } from "./api";

interface HighScore {
  score: number;
  date: string;
}

function getStorageKey(config: GameConfig): string {
  return `highscore_${config.rows}x${config.cols}_${config.powder}_ta${config.ta ? 1 : 0}`;
}

export function getHighScore(config: GameConfig): number {
  try {
    const key = getStorageKey(config);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed: HighScore = JSON.parse(data);
      return parsed.score;
    }
  } catch (e) {
    console.error("Failed to get high score:", e);
  }
  return 0;
}

export function saveHighScore(config: GameConfig, score: number): void {
  try {
    const key = getStorageKey(config);
    const current = getHighScore(config);
    if (score > current) {
      const data: HighScore = {
        score,
        date: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error("Failed to save high score:", e);
  }
}

export interface AllHighScores {
  config: string;
  score: number;
  date: string;
}

export function getAllHighScores(): AllHighScores[] {
  const scores: AllHighScores[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("highscore_")) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed: HighScore = JSON.parse(data);
          scores.push({
            config: key.replace("highscore_", "").replace(/_/g, " "),
            score: parsed.score,
            date: new Date(parsed.date).toLocaleDateString(),
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to get all high scores:", e);
  }
  return scores.sort((a, b) => b.score - a.score);
}
