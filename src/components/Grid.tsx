import { getColumnLabel, getRowLabel } from "@/lib/labels";
import { TileState } from "@/hooks/useGame";
import { cn } from "@/lib/utils";

interface GridProps {
  rows: number;
  cols: number;
  tiles: TileState[][];
  coreZone: { r0: number; r1: number; c0: number; c1: number };
  overheatSector: number;
  onTileClick: (row: number, col: number) => void;
}

export function Grid({ rows, cols, tiles, coreZone, overheatSector, onTileClick }: GridProps) {
  const isInCore = (row: number, col: number) => {
    return row >= coreZone.r0 && row < coreZone.r1 && 
           col >= coreZone.c0 && col < coreZone.c1;
  };

  const isInOverheatSector = (row: number, col: number) => {
    // Outer ring check
    const isOuterRing = row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
    if (!isOuterRing) return false;

    // Sector logic: 0=top, 1=right, 2=bottom, 3=left
    switch (overheatSector) {
      case 0: return row === 0;
      case 1: return col === cols - 1;
      case 2: return row === rows - 1;
      case 3: return col === 0;
      default: return false;
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="inline-block">
        {/* Column labels */}
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
          {/* Row labels */}
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
                const inOverheat = isInOverheatSector(rowIdx, colIdx);

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => onTileClick(rowIdx, colIdx)}
                    disabled={tile.revealed}
                    className={cn(
                      "aspect-square rounded-md border-2 transition-all duration-120",
                      "will-change-transform",
                      !tile.revealed && "bg-tile border-tile-border hover:scale-105 hover:glow-cyan",
                      tile.revealed && tile.isScrap && "bg-scrap border-scrap animate-tile-reveal",
                      tile.revealed && !tile.isScrap && "bg-safe border-safe animate-tile-reveal",
                      inCore && !tile.revealed && "ring-1 ring-primary ring-opacity-30",
                      inOverheat && !tile.revealed && "ring-2 ring-unstable animate-pulse-glow"
                    )}
                    aria-label={`Tile ${getRowLabel(rowIdx)}${getColumnLabel(colIdx)}`}
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
