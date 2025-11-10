const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface GameConfig {
  rows: number;
  cols: number;
  powder: "Virgin" | "Recycled";
  ta: boolean;
}

export interface BoardResponse {
  rows: number;
  cols: number;
  board: number[][];
  core: { r0: number; r1: number; c0: number; c1: number };
}

export async function fetchPredict(config: GameConfig): Promise<BoardResponse> {
  const url = `${BASE}/predict?rows=${config.rows}&cols=${config.cols}&powder=${config.powder}&ta=${config.ta ? 1 : 0}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}