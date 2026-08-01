import { useState } from "react";
import { Eye, Volume2, Type, Keyboard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AccessibilityTab() {
  const [screenReader, setScreenReader] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [tts, setTts] = useState(false);
  const [largeTargets, setLargeTargets] = useState(false);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean, msg: string) => {
    setter(value);
    toast.success(msg);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Accessibility</h2>
        <p className="text-sm text-muted-foreground">Make the application easier to use and read.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-6">
            
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-[80%]">
                <Label className="flex items-center gap-2 font-medium">
                  <Type className="h-4 w-4" /> Screen Reader Optimization
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adds extra ARIA labels and optimizes the chat flow for screen readers like VoiceOver and NVDA.
                </p>
              </div>
              <Switch checked={screenReader} onCheckedChange={(v) => handleToggle(setScreenReader, v, "Screen reader optimization updated")} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-[80%]">
                <Label className="flex items-center gap-2 font-medium">
                  <Eye className="h-4 w-4" /> High Contrast Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Increases contrast of text and borders for better visibility. Overrides current theme colors.
                </p>
              </div>
              <Switch checked={highContrast} onCheckedChange={(v) => handleToggle(setHighContrast, v, "High contrast mode updated")} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-[80%]">
                <Label className="flex items-center gap-2 font-medium">
                  <Volume2 className="h-4 w-4" /> Auto Text-to-Speech
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically read aloud AI responses as they are generated.
                </p>
              </div>
              <Switch checked={tts} onCheckedChange={(v) => handleToggle(setTts, v, "Text-to-speech preferences updated")} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-[80%]">
                <Label className="flex items-center gap-2 font-medium">
                  <Keyboard className="h-4 w-4" /> Larger Click Targets
                </Label>
                <p className="text-xs text-muted-foreground">
                  Increases the size of buttons, toggles, and links for easier clicking and tapping.
                </p>
              </div>
              <Switch checked={largeTargets} onCheckedChange={(v) => handleToggle(setLargeTargets, v, "Click targets updated")} />
            </div>

          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Keyboard Shortcuts</h3>
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-2 bg-background rounded-lg border border-border/30">
                <span className="text-muted-foreground">New Chat</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-background rounded-lg border border-border/30">
                <span className="text-muted-foreground">Focus Input</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">/</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-background rounded-lg border border-border/30">
                <span className="text-muted-foreground">Toggle Sidebar</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + \</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-background rounded-lg border border-border/30">
                <span className="text-muted-foreground">Stop Generation</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
