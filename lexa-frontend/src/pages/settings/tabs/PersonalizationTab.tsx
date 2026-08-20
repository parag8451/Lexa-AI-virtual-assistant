import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SettingRow, SettingsCard, SettingsPage, SettingsSection } from "./primitives.tsx";

const TRAITS = ["Friendly", "Professional", "Witty", "Direct", "Encouraging", "Socratic"];
const MAX_INSTRUCTIONS = 1500;

export function PersonalizationTab() {
  const [nickname, setNickname] = React.useState("");
  const [tone, setTone] = React.useState("balanced");
  const [instructions, setInstructions] = React.useState("");
  const [traits, setTraits] = React.useState<string[]>([]);

  const toggleTrait = (trait: string) =>
    setTraits((prev) => (prev.includes(trait) ? prev.filter((item) => item !== trait) : [...prev, trait]));

  return (
    <SettingsPage title="Personalization" description="Shape how the assistant talks with you.">
      <SettingsSection title="Identity">
        <SettingsCard className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="nickname">What should the assistant call you?</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Parag"
              className="max-w-md"
            />
          </div>
          <SettingRow
            title="Default tone"
            description="Sets the overall personality of responses."
            control={
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Personality traits" description="Pick a few to fine-tune the assistant's style.">
        <SettingsCard>
          <div className="flex flex-wrap gap-2">
            {TRAITS.map((trait) => {
              const active = traits.includes(trait);
              return (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {trait}
                </button>
              );
            })}
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Custom instructions">
        <SettingsCard className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="custom-instructions">Anything the assistant should always keep in mind</Label>
            <textarea
              id="custom-instructions"
              value={instructions}
              maxLength={MAX_INSTRUCTIONS}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              placeholder="e.g. I'm a frontend developer. Prefer TypeScript examples and keep explanations concise."
              className="flex w-full resize-none rounded-lg border border-border/40 bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              {instructions.length}/{MAX_INSTRUCTIONS}
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => toast.success("Personalization saved")}>
              <Save className="h-4 w-4" />
              Save preferences
            </Button>
          </div>
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}