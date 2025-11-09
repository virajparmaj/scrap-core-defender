const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  core: {
    r0: number;
    r1: number;
    c0: number;
    c1: number;
  };
}

export async function fetchPredict(config: GameConfig): Promise<BoardResponse> {
  const params = new URLSearchParams({
    rows: config.rows.toString(),
    cols: config.cols.toString(),
    powder: config.powder,
    ta: config.ta ? "1" : "0",
  });

  const response = await fetch(`${API_URL}/predict?${params}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to fetch board");
  }

  return response.json();
}
