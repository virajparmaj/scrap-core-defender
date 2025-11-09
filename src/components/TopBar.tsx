import { Button } from "@/components/ui/button";
import { Home, BookOpen, Trophy } from "lucide-react";

interface TopBarProps {
  onHome: () => void;
  onRules: () => void;
  onHighScores: () => void;
  showHomeButton?: boolean;
}

export function TopBar({ onHome, onRules, onHighScores, showHomeButton = true }: TopBarProps) {
  return (
    <div className="w-full border-b border-border bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary text-glow-cyan">
            Build Plate Survivor
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">ML-Powered Defect Training</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRules}>
            <BookOpen className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Rules</span>
          </Button>
          
          <Button variant="outline" size="sm" onClick={onHighScores}>
            <Trophy className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Scores</span>
          </Button>
          
          {showHomeButton && (
            <Button variant="outline" size="sm" onClick={onHome}>
              <Home className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Home</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
