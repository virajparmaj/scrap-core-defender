import { getColumnLabel, getRowLabel } from "@/lib/labels";
import { TileState } from "@/hooks/useGame";
import { cn } from "@/lib/utils";

interface GridProps {
  rows: number;
  cols: number;
  tiles: TileState[][];
  coreZone?: { r0: number; r1: number; c0: number; c1: number };
  onTileClick: (row: number, col: number) => void;
}

export function Grid({ rows, cols, tiles, coreZone, onTileClick }: GridProps) {
  // If board not ready yet → don't render grid yet
  if (!tiles.length || !coreZone) {
    return (
      <div className="flex justify-center text-primary mt-10 animate-pulse">
        Building core zone...
      </div>
    );
  }

  const isInCore = (row: number, col: number) =>
    row >= coreZone.r0 &&
    row < coreZone.r1 &&
    col >= coreZone.c0 &&
    col < coreZone.c1;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="inline-block">

        {/* Column Labels */}
        <div className="flex mb-2 ml-8">
          {Array.from({ length: cols }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-center font-mono text-xs text-primary"
              style={{ width: "clamp(32px, 8vw, 64px)" }}
            >
              {getColumnLabel(i)}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row Labels */}
          <div className="flex flex-col mr-2">
            {Array.from({ length: rows }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-center font-mono text-xs text-primary"
                style={{ height: "clamp(32px, 8vw, 64px)" }}
              >
                {getRowLabel(i)}
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
            {tiles.map((row, rowIdx) =>
              row.map((tile, colIdx) => {
                const inCore = isInCore(rowIdx, colIdx);

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => onTileClick(rowIdx, colIdx)}
                    disabled={tile.revealed}
                    className={cn(
                      "aspect-square rounded-md border border-neutral-700 transition-transform duration-150",
                      "will-change-transform",
                      !tile.revealed && "bg-neutral-800 hover:scale-105",
                      tile.revealed && tile.isScrap && "bg-red-600 border-red-400 rotate-90",
                      tile.revealed && !tile.isScrap && "bg-green-500 border-green-300 rotate-90",
                      inCore && !tile.revealed && "ring-1 ring-white/30"
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