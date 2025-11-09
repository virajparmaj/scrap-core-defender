import { useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { TopBar } from "@/components/TopBar";
import { Settings } from "@/components/Settings";
import { Grid } from "@/components/Grid";
import { HUD } from "@/components/HUD";
import { Modal } from "@/components/Modal";
import { GameOverDialog } from "@/components/GameOverDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const game = useGame();
  const timer = useTimer(game.gameState === "playing");
  const [modalType, setModalType] = useState<"rules" | "scores" | null>(null);

  const handleStart = async (config: typeof game.config) => {
    try {
      await game.startGame(config);
    } catch (error) {
      toast.error("Failed to start game. Make sure the backend is running.");
    }
  };

  const handleRestart = () => {
    handleStart(game.config);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        onHome={game.resetGame}
        onRules={() => setModalType("rules")}
        onHighScores={() => setModalType("scores")}
        showHomeButton={game.gameState !== "idle"}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {game.gameState === "idle" && (
          <div className="w-full space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-lime bg-clip-text text-transparent">
                Welcome to Build Plate Survivor
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Train your defect detection skills with ML-powered board generation. 
                Click safe tiles, avoid scrap, and master the core mechanics to achieve high scores.
              </p>
            </div>
            <Settings onStart={handleStart} />
          </div>
        )}

        {game.gameState === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-mono">Generating build plate...</p>
          </div>
        )}

        {game.gameState === "playing" && (
          <div className="w-full space-y-6">
            <HUD
              score={game.score}
              multiplier={game.multiplier}
              multiplierRemaining={game.multiplierRemaining}
              highScore={game.highScore}
              isPlaying={true}
            />
            <Grid
              rows={game.config.rows}
              cols={game.config.cols}
              tiles={game.tiles}
              coreZone={game.coreZone}
              overheatSector={timer.sector}
              onTileClick={game.revealTile}
            />
            <div className="flex justify-center">
              <Button variant="outline" onClick={game.resetGame}>
                End Game
              </Button>
            </div>
          </div>
        )}

        {game.error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md">
            <p className="text-destructive text-center">{game.error}</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={game.resetGame} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </main>

      <Modal
        open={modalType !== null}
        onOpenChange={(open) => !open && setModalType(null)}
        type={modalType || "rules"}
      />

      <GameOverDialog
        open={game.gameState === "gameover"}
        score={game.score}
        highScore={game.highScore}
        isNewRecord={game.score > game.highScore}
        onRestart={handleRestart}
        onHome={game.resetGame}
      />
    </div>
  );
};

export default Index;
