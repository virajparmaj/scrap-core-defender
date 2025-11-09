import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GameConfig } from "@/lib/api";
import { Rocket } from "lucide-react";

interface SettingsProps {
  onStart: (config: GameConfig) => void;
  disabled?: boolean;
}

export function Settings({ onStart, disabled }: SettingsProps) {
  const [rows, setRows] = useState(7);
  const [cols, setCols] = useState(7);
  const [powder, setPowder] = useState<"Virgin" | "Recycled">("Virgin");
  const [ta, setTa] = useState(false);

  const handleStart = () => {
    onStart({ rows, cols, powder, ta });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-card border border-border rounded-lg p-8 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary text-glow-cyan mb-2">Configure Your Build</h2>
          <p className="text-muted-foreground text-sm">Select grid size and process parameters</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Rows */}
          <div className="space-y-2">
            <Label htmlFor="rows" className="font-mono text-sm uppercase tracking-wide">Rows</Label>
            <Select value={rows.toString()} onValueChange={(v) => setRows(parseInt(v))}>
              <SelectTrigger id="rows">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 9 }, (_, i) => i + 3).map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Columns */}
          <div className="space-y-2">
            <Label htmlFor="cols" className="font-mono text-sm uppercase tracking-wide">Columns</Label>
            <Select value={cols.toString()} onValueChange={(v) => setCols(parseInt(v))}>
              <SelectTrigger id="cols">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 9 }, (_, i) => i + 3).map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Powder */}
          <div className="space-y-2">
            <Label htmlFor="powder" className="font-mono text-sm uppercase tracking-wide">Powder Phase</Label>
            <Select value={powder} onValueChange={(v) => setPowder(v as "Virgin" | "Recycled")}>
              <SelectTrigger id="powder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Virgin">Virgin</SelectItem>
                <SelectItem value="Recycled">Recycled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TA */}
          <div className="space-y-2">
            <Label htmlFor="ta" className="font-mono text-sm uppercase tracking-wide">Thermal Anneal</Label>
            <div className="flex items-center space-x-2 h-10">
              <Switch id="ta" checked={ta} onCheckedChange={setTa} />
              <span className="text-sm text-muted-foreground">{ta ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={disabled}
          className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan"
        >
          <Rocket className="mr-2 h-5 w-5" />
          Start Game
        </Button>
      </div>
    </div>
  );
}
