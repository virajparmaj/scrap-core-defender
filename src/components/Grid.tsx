import { getColumnLabel, getRowLabel } from "@/lib/labels";
import { TileState } from "@/hooks/useGame";
import { cn } from "@/lib/utils";

interface GridProps {
  rows: number;
  cols: number;
  tiles: TileState[][];
  coreMask: boolean[][];        // ✅ new
  turnMode: "core" | "noncore" | "free";
  onTileClick: (row: number, col: number) => void;
}

export function Grid({ rows, cols, tiles, coreMask, turnMode, onTileClick }: GridProps) {
  if (!tiles.length || !coreMask.length) {
    return (
      <div className="flex justify-center text-primary mt-10 animate-pulse">
        Generating board...
      </div>
    );
  }

  // ✅ Core membership now comes from backend mask
const inCore = (r: number, c: number) => coreMask[r][c];

  const canClick = (r: number, c: number) => {
    if (tiles[r][c].revealed) return false;
    if (turnMode === "free") return true;
    if (turnMode === "core" && inCore(r, c)) return true;
    if (turnMode === "noncore" && !inCore(r, c)) return true;
    return false;
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="inline-block">

        {/* Column Labels */}
        <div className="flex mb-2 ml-8">
          {Array.from({ length: cols }, (_, c) => (
            <div
              key={c}
              className="flex items-center justify-center font-mono text-xs text-primary"
              style={{ width: "clamp(32px, 8vw, 64px)" }}
            >
              {getColumnLabel(c)}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row Labels */}
          <div className="flex flex-col mr-2">
            {Array.from({ length: rows }, (_, r) => (
              <div
                key={r}
                className="flex items-center justify-center font-mono text-xs text-primary"
                style={{ height: "clamp(32px, 8vw, 64px)" }}
              >
                {getRowLabel(r)}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="relative"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, minmax(32px, 64px))`,
              gap: "8px",
            }}
          >
            {tiles.map((row, r) =>
              row.map((tile, c) => {
                const core = inCore(r, c);
                const clickable = canClick(r, c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => clickable && onTileClick(r, c)}
                    disabled={!clickable}
                    className={cn(
                      "aspect-square rounded-md border transition-transform duration-150 will-change-transform",

                      // ✅ Revealed states
                      tile.revealed && tile.isScrap && "bg-red-600 border-red-400 rotate-90",
                      tile.revealed && !tile.isScrap && "bg-green-500 border-green-300 rotate-90",

                      // ✅ Hidden + clickable
                      !tile.revealed && clickable && "bg-neutral-800 border-neutral-600 hover:scale-105 cursor-pointer",

                      // ✅ Hidden + not clickable
                      !tile.revealed && !clickable && "bg-neutral-900 border-neutral-800 opacity-40 cursor-not-allowed",

                      // ✅ Highlight core during core-turn
                      core && !tile.revealed && turnMode === "core" && "ring-2 ring-blue-400/60",

                      // ✅ Highlight non-core during noncore-turn
                      !core && !tile.revealed && turnMode === "noncore" && "ring-1 ring-yellow-300/40"
                    )}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}