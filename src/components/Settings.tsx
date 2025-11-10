import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GameConfig } from "@/lib/api";
import { Rocket } from "lucide-react";

interface SettingsProps {
  onStart: (config: GameConfig) => void;
  disabled?: boolean;
}

const GRID_SIZES = Array.from({ length: 9 }, (_, i) => i + 3); // 3–11

export function Settings({ onStart, disabled }: SettingsProps) {
  const [size, setSize] = useState(7);
  const [powder, setPowder] = useState<"Virgin" | "Recycled">("Virgin");
  const [ta, setTa] = useState(false);

  const handleStart = () =>
    onStart({ rows: size, cols: size, powder, ta });

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-xl">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-primary text-glow-cyan">
            Configure Your Build
          </h2>
          <p className="text-muted-foreground text-sm">
            Select grid size and process parameters
          </p>
        </div>

        {/* Grid Size + Powder Phase side-by-side */}
        <div className="flex justify-center gap-6">
          {/* Grid Size */}
          <div className="space-y-1 text-center">
            <Label className="font-mono text-xs uppercase tracking-wide">GRID SIZE</Label>
            <Select value={size.toString()} onValueChange={(v) => setSize(parseInt(v))}>
              <SelectTrigger className="w-36 text-sm h-8 mx-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="center">
                {GRID_SIZES.map((n) => (
                  <SelectItem key={n} value={n.toString()} className="text-center text-sm">
                    {n} × {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Powder Phase */}
          <div className="space-y-1 text-center">
            <Label className="font-mono text-xs uppercase tracking-wide">POWDER PHASE</Label>
            <Select value={powder} onValueChange={(v) => setPowder(v as "Virgin" | "Recycled")}>
              <SelectTrigger className="w-36 text-sm h-8 mx-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="center">
                <SelectItem value="Virgin" className="text-center text-sm">Virgin</SelectItem>
                <SelectItem value="Recycled" className="text-center text-sm">Recycled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Test Artifacts centered below */}
        <div className="space-y-1 text-center">
          <Label className="font-mono text-xs uppercase tracking-wide">TEST ARTIFACTS</Label>
          <div className="flex justify-center items-center space-x-2">
            <Switch checked={ta} onCheckedChange={setTa} />
            <span className="text-sm text-muted-foreground">
              {ta ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleStart}
            disabled={disabled}
            className="w-64 h-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan"
          >
            <Rocket className="mr-3 h-5 w-5" />
            Start Game
          </Button>
        </div>
      </div>

      {/* Notes outside the card */}
      <div className="mt-6 space-y-3 text-center">

        {/* Scrap-rate note */}
        <div className="flex flex-col items-center text-cyan-300 font-semibold text-sm leading-snug px-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sky-400 text-xl">⚡</span>
            <span className="text-base font-bold tracking-wide text-cyan-200">
              Model Scrap Notice
            </span>
          </div>
          <p className="max-w-md text-cyan-100/80">
            The model weights are tuned to yield ~10× more visible scrap for gameplay.
            Real scrap rates are typically only <strong className="text-cyan-50">1–3%</strong>.
          </p>
        </div>

        {/* Free-tier cold start note */}
        <div className="flex flex-col items-center text-violet-300 font-semibold text-sm leading-snug px-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-violet-400 text-xl">💤</span>
            <span className="text-base font-bold tracking-wide text-violet-200">
              Free-Tier Server Delay
            </span>
          </div>
          <p className="max-w-md text-violet-100/80">
            The GAME is hosted on a free server — the
            <strong className="text-violet-50"> first setting may take 45–60 seconds to laod</strong>.
            Subsequent tries will work instantly.
          </p>
        </div>

      </div>
    </div>
  );
}