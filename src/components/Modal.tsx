import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllHighScores } from "@/lib/storage";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "rules" | "scores";
}

export function Modal({ open, onOpenChange, type }: ModalProps) {
  if (type === "rules") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary text-glow-cyan">Game Rules</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm">

              {/* Objective */}
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🎮 Objective</h3>
                <p className="text-muted-foreground">
                  Reveal as many safe tiles as possible without hitting scrap. Each safe reveal earns points. Hitting scrap ends the run.
                </p>
              </section>

              {/* Setup */}
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">⚙️ Setup</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Select grid size (3×3 to 11×11)</li>
                  <li>Choose powder condition: <strong>Virgin</strong> or <strong>Recycled</strong></li>
                  <li>Optional: Enable <strong>TEST ARTIFACTS (TA)</strong> to introduce patterned visual noise</li>
                </ul>
              </section>

              {/* Tile Types */}
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🎯 Tile Types</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><span className="text-safe font-bold">Green</span> — Safe tile (+1 point)</li>
                  <li><span className="text-scrap font-bold">Red</span> — Scrap (Game Over)</li>
                  <li><span className="text-primary font-bold">Core Zone</span> — Center region that is always safe</li>
                  <li><span className="text-unstable font-bold">Unstable Ring</span> — Visually shifts over time (safe, but unpredictable in pattern)</li>
                </ul>
              </section>

              {/* Core Mechanics */}
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🔥 Core Mechanics</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Turn Order:</strong> The game begins in <strong>Core Mode</strong>. Your first click must be inside the Core.</li>
                  <li>After each reveal, turn mode alternates:
                    <br />→ Core → Non-Core → Core → Non-Core → …
                  </li>
                  <li><strong>Free Mode Unlock:</strong> Once <strong>every core tile</strong> has been revealed, all turn restrictions are removed — you may click freely anywhere.</li>
                  <li><strong>Core Size:</strong> Depends on board size (1×1, 2×2, or 3×3). These tiles are guaranteed safe.</li>
                </ul>
              </section>

              {/* Scoring */}
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🏆 Scoring</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Each safe reveal = <strong>+1 point</strong></li>
                  <li>Game ends immediately on scrap</li>
                  <li>High scores are tracked separately for each grid configuration</li>
                  <li>Challenge yourself to beat past runs!</li>
                </ul>
              </section>

              {/* Strategy Tips */}
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">💡 Strategy Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Start by clearing the Core first — unlocking free mode removes restrictions</li>
                  <li>Expand outward methodically once the Core is secured</li>
                  <li>Use board symmetry to your advantage</li>
                  <li>Larger boards = harder, but higher scoring potential</li>
                </ul>
              </section>

            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  const scores = getAllHighScores();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary text-glow-cyan">High Scores</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {scores.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No high scores yet. Start playing to set records!
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((score, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/50 border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-sm text-muted-foreground">{score.config}</div>
                    <div className="text-xs text-muted-foreground mt-1">{score.date}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary text-glow-cyan">{score.score}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}