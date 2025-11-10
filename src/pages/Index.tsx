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
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://scrap-core-defender.onrender.com";

const Index = () => {
  const game = useGame();
  useTimer(game.gameState === "playing");

  const [modalType, setModalType] = useState<"rules" | "scores" | null>(null);

  const handleStart = async (config: typeof game.config) => {
    try {
      const query = new URLSearchParams({
        rows: String(config.rows),
        cols: String(config.rows),
        powder: config.powder,
        ta: String(config.ta ? 1 : 0),
      });

      game.startGame(config); // triggers loading state immediately

      const response = await fetch(`${API_BASE_URL}/predict?${query}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      game.finishLoading(data.board, data.core);
    } catch (err) {
      console.error(err);
      toast.error("Server is waking up. Try again in a moment.");
      game.resetGame();
    }
  };

  const handleRestart = () => handleStart(game.config);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        onHome={game.resetGame}
        onRules={() => setModalType("rules")}
        onHighScores={() => setModalType("scores")}
        showHomeButton={game.gameState !== "idle"}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">

        {/* 🟡 Idle Screen */}
        {game.gameState === "idle" && (
          <div className="w-full space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-lime bg-clip-text text-transparent">
                Build Plate Survivor
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Click Safe — Avoid Scrap — Master Core.
              </p>
            </div>
            <Settings onStart={handleStart} />
          </div>
        )}

        {/* 🟣 NEW Loading Screen */}
        {game.gameState === "loading" && (
          <div className="w-full flex flex-col items-center justify-center text-center py-16 space-y-4">
            <div className="animate-pulse text-xl font-semibold text-primary mb-4">
              ⚙️ Warming up the build chamber...
            </div>

            <p className="text-muted-foreground max-w-sm mb-4">
              First game may take <strong>45–60 seconds</strong> while the server boots up.
              Future games are <strong>instant.</strong>
            </p>

            <div className="text-lg font-mono text-foreground">
              {game.loadingSeconds}s elapsed...
            </div>

            <Button
              onClick={game.resetGame}
              variant="ghost"
              className="mt-6 text-primary underline"
            >
              Cancel & Return
            </Button>
          </div>
        )}

        {/* 🟢 Playing */}
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
              cols={game.config.rows}
              tiles={game.tiles}
              coreMask={game.coreMask}
              turnMode={game.turnMode}
              onTileClick={game.revealTile}
            />

            <div className="flex justify-center">
              <Button variant="outline" onClick={game.resetGame}>
                End Game
              </Button>
            </div>
          </div>
        )}

        {/* 🔥 Error state */}
        {game.error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md text-center">
            <p className="text-destructive">{game.error}</p>
            <Button onClick={game.resetGame} variant="outline" className="mt-4">
              Back to Home
            </Button>
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