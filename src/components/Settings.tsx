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
      <div className="bg-card border border-border rounded-lg p-6 space-y-5 shadow-xl">

        {/* Title */}
        <div className="text-center space-y-1 mb-2">
          <h2 className="text-3xl font-bold text-primary text-glow-cyan">
            Configure Your Build
          </h2>
          <p className="text-muted-foreground text-sm">
            Select grid size and process parameters
          </p>
        </div>

        <div className="space-y-4">
          {/* Grid Size */}
          <div className="space-y-1 text-center">
            <Label className="font-mono text-sm uppercase tracking-wide">
              GRID SIZE (N × N)
            </Label>
            <Select value={size.toString()} onValueChange={(v) => setSize(parseInt(v))}>
              <SelectTrigger className="w-40 mx-auto text-center h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="center">
                {GRID_SIZES.map((n) => (
                  <SelectItem
                    key={n}
                    value={n.toString()}
                    className="text-center text-sm"
                  >
                    {n} × {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Powder Phase */}
          <div className="space-y-1 text-center">
            <Label className="font-mono text-sm uppercase tracking-wide">
              POWDER PHASE
            </Label>
            <Select value={powder} onValueChange={(v) => setPowder(v as "Virgin" | "Recycled")}>
              <SelectTrigger className="w-40 mx-auto text-center h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="center">
                <SelectItem className="text-center text-sm" value="Virgin">
                  Virgin
                </SelectItem>
                <SelectItem className="text-center text-sm" value="Recycled">
                  Recycled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Thermal Anneal */}
          <div className="space-y-1 text-center">
            <Label className="font-mono text-sm uppercase tracking-wide">
              TEST ARTIFACTS
            </Label>
            <div className="flex justify-center items-center space-x-2">
              <Switch checked={ta} onCheckedChange={setTa} />
              <span className="text-sm text-muted-foreground">
                {ta ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Smaller Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleStart}
            disabled={disabled}
            className="w-64 h-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan"
          >
          <Rocket className="mr-4 h-8 w-8" />
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}