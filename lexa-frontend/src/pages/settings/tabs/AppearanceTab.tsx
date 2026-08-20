import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { SettingsPage, SettingsSection, SettingsCard } from "./primitives";

export function AppearanceTab() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  const handleTheme = (t: string) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else if (t === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System default
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  return (
    <SettingsPage
      title="Appearance"
      description="Customize how the app looks and feels on your device."
      icon={<Palette className="h-6 w-6 text-primary" />}
    >
      <SettingsSection
        title="Theme Preference"
        description="Select a visual mode or sync automatically with your system."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SettingsCard
            interactive
            onClick={() => handleTheme("light")}
            className={`flex cursor-pointer flex-col items-center gap-3 p-5 text-center transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/40 hover:bg-muted/40"
            }`}
          >
            <div className={`p-3 rounded-full ${theme === "light" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-sm font-semibold">Light</span>
              <span className="block text-xs text-muted-foreground">Bright and clean interface</span>
            </div>
          </SettingsCard>

          <SettingsCard
            interactive
            onClick={() => handleTheme("dark")}
            className={`flex cursor-pointer flex-col items-center gap-3 p-5 text-center transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/40 hover:bg-muted/40"
            }`}
          >
            <div className={`p-3 rounded-full ${theme === "dark" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-sm font-semibold">Dark</span>
              <span className="block text-xs text-muted-foreground">Easy on the eyes at night</span>
            </div>
          </SettingsCard>

          <SettingsCard
            interactive
            onClick={() => handleTheme("system")}
            className={`flex cursor-pointer flex-col items-center gap-3 p-5 text-center transition-all ${
              theme === "system"
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/40 hover:bg-muted/40"
            }`}
          >
            <div className={`p-3 rounded-full ${theme === "system" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-sm font-semibold">System</span>
              <span className="block text-xs text-muted-foreground">Sync with OS preferences</span>
            </div>
          </SettingsCard>
        </div>
      </SettingsSection>
    </SettingsPage>
  );
}
