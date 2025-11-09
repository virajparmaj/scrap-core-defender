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
              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🎮 Objective</h3>
                <p className="text-muted-foreground">
                  Reveal as many safe tiles as possible without hitting scrap. Each safe tile increases your score.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">⚙️ Setup</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Select grid size (3×3 to 11×11)</li>
                  <li>Choose powder type: Virgin or Recycled</li>
                  <li>Toggle Thermal Anneal (TA) on/off</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🎯 Tile Types</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><span className="text-safe font-bold">Green</span> = Safe tile (+1 point)</li>
                  <li><span className="text-scrap font-bold">Red</span> = Scrap (Game Over)</li>
                  <li><span className="text-primary font-bold">Core Zone</span> (outlined) = Always safe, thermally stable</li>
                  <li><span className="text-unstable font-bold">Amber ring</span> = Unstable zone (changes every 10s)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🔥 Core Mechanics</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Core Combo:</strong> Click any core tile first to activate ×2 multiplier for next 4 reveals outside core</li>
                  <li><strong>Overheat Timer:</strong> Unstable zones rotate every 10 seconds. Clicking there breaks your combo but is otherwise safe</li>
                  <li><strong>Safe Core:</strong> Center tiles (3×3, 2×2, or 1×1 depending on grid size) are guaranteed safe</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">🏆 Scoring</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Safe tile = +1 point (or +2 with active multiplier)</li>
                  <li>High scores are saved per configuration</li>
                  <li>Try to beat your previous records!</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg text-foreground mb-2">💡 Strategy Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Start with core tiles to activate the multiplier</li>
                  <li>Work outward strategically from the safe center</li>
                  <li>Watch the overheat timer to avoid breaking combos</li>
                  <li>Larger grids = more risk but higher potential scores</li>
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
