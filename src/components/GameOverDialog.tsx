import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, Trophy } from "lucide-react";

interface GameOverDialogProps {
  open: boolean;
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export function GameOverDialog({ open, score, highScore, isNewRecord, onRestart, onHome }: GameOverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">
            <span className="text-scrap">Game Over</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="text-center">
            <div className="text-sm font-mono text-muted-foreground uppercase tracking-wide mb-2">
              Final Score
            </div>
            <div className="text-6xl font-bold text-primary text-glow-cyan">{score}</div>
          </div>

          {isNewRecord && (
            <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 text-center animate-pulse-glow">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="font-bold text-accent text-lg">New High Score!</div>
            </div>
          )}

          {!isNewRecord && highScore > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              High Score: <span className="font-bold text-lime">{highScore}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={onRestart} className="flex-1 bg-primary hover:bg-primary/90 glow-cyan">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button onClick={onHome} variant="outline" className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
