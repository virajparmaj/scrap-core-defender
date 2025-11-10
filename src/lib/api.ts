const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface GameConfig {
  rows: number;
  cols?: number; // ✅ now optional, always overridden
  powder: "Virgin" | "Recycled";
  ta: boolean;
  backendBoard?: number[][]; // ✅ optional board from backend
}

export interface BoardResponse {
  rows: number;
  cols: number;
  board: number[][];
  core?: { r0: number; r1: number; c0: number; c1: number }; // ✅ optional fallback support
}

export async function fetchPredict(config: GameConfig): Promise<BoardResponse> {
  const size = config.rows; // ✅ enforce square grid

  const url = `${BASE}/predict?rows=${size}&cols=${size}&powder=${config.powder}&ta=${config.ta ? 1 : 0}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText} (${res.status})`);
  }

  const data = await res.json();

  // ✅ Ensure backend response always has a core zone
  if (!data.core) {
    const mid = Math.floor(size / 2);
    data.core = {
      r0: mid - 1,
      r1: mid + 2,
      c0: mid - 1,
      c1: mid + 2,
    };
  }

  return data;
}