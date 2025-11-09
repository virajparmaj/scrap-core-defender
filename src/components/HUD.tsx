import { useTimer } from "@/hooks/useTimer";

interface HUDProps {
  score: number;
  multiplier: number;
  multiplierRemaining: number;
  highScore: number;
  isPlaying: boolean;
}

export function HUD({ score, multiplier, multiplierRemaining, highScore, isPlaying }: HUDProps) {
  const timer = useTimer(isPlaying);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Score */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Score</div>
          <div className="text-3xl font-bold text-primary text-glow-cyan mt-1">{score}</div>
        </div>

        {/* High Score */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">High Score</div>
          <div className="text-3xl font-bold text-lime mt-1">{highScore}</div>
        </div>

        {/* Multiplier */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Multiplier</div>
          <div className="text-3xl font-bold text-accent text-glow-magenta mt-1">
            {multiplier > 1 ? `×${multiplier}` : "×1"}
          </div>
          {multiplierRemaining > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {multiplierRemaining} reveals left
            </div>
          )}
        </div>

        {/* Overheat Timer */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Unstable Zone</div>
          <div className="text-xl font-bold text-unstable mt-1">{timer.sectorName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.ceil(timer.timeRemaining)}s remaining
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4">
        <div className="flex flex-wrap gap-6 justify-center items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-safe rounded border border-safe"></div>
            <span className="font-mono">Safe Tile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-scrap rounded border border-scrap"></div>
            <span className="font-mono">Scrap (Game Over)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tile rounded border-2 border-primary ring-1 ring-primary"></div>
            <span className="font-mono">Core Zone (Safe)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tile rounded border-2 border-unstable ring-2 ring-unstable"></div>
            <span className="font-mono">Unstable Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
