// lib/api.ts

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface GameConfig {
  rows: number;             // size (N×N)
  cols?: number;            // optional; always set to rows
  powder: "Virgin" | "Recycled";
  ta: boolean;
}

export interface BoardResponse {
  rows: number;
  cols: number;
  board: number[][];

  /**
   * ✅ Core mask (1 = core tile, 0 = non-core).
   * Always provided by backend.
   */
  core: number[][];
}

export async function fetchPredict(config: GameConfig): Promise<BoardResponse> {
  const size = config.rows; // enforce square
  const url = `${BASE}/predict?rows=${size}&cols=${size}&powder=${config.powder}&ta=${config.ta ? 1 : 0}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  /**
   * ✅ Ensure core mask always exists
   * (backend now returns a boolean mask but we convert to number[][] for consistency)
   */
  if (!data.core) {
    throw new Error("Backend did not provide core mask. Update backend /predict to include core.");
  }

  // normalize core to number[][]
  data.core = data.core.map((row: any[]) => row.map((v: any) => (v ? 1 : 0)));

  return {
    rows: size,
    cols: size,
    board: data.board,
    core: data.core,
  };
}