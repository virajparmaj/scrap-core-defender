// lib/api.ts
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface GameConfig {
  rows: number; // N × N grid
  powder: "Virgin" | "Recycled";
  ta: boolean;
  backendBoard?: number[][]; // optional for injected backend data
}

export interface BoardResponse {
  rows: number;
  cols: number;
  board: number[][];
  core: number[][]; // 1 = core tile, 0 = non-core
}

export async function fetchPredict(config: GameConfig): Promise<BoardResponse> {
  const size = config.rows; // enforce square grid

  const url = `${BASE}/predict?rows=${size}&cols=${size}&powder=${config.powder}&ta=${config.ta ? 1 : 0}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.status} (${res.statusText})`);
  }

  const data = await res.json();

  // ✅ Core mask now required from backend
  if (!data.core) {
    throw new Error("Backend did not provide core mask. Please update /predict to include `core`.");
  }

  // Ensure mask is always number[][]
  const coreMask = data.core.map((row: any[]) => row.map((v: any) => (v ? 1 : 0)));

  return {
    rows: size,
    cols: size,
    board: data.board,
    core: coreMask,
  };
}