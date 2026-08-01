import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Label } from "@/components/ui/label";

export function AppearanceTab() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  const handleTheme = (t: string) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how the app looks.</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => handleTheme("light")} className={`p-4 rounded-xl border ${theme === "light" ? "border-primary bg-primary/5" : "border-border/40 hover:bg-muted/50"} flex flex-col items-center gap-2`}>
          <Sun className="h-6 w-6" />
          <span className="text-sm font-medium">Light</span>
        </button>
        <button onClick={() => handleTheme("dark")} className={`p-4 rounded-xl border ${theme === "dark" ? "border-primary bg-primary/5" : "border-border/40 hover:bg-muted/50"} flex flex-col items-center gap-2`}>
          <Moon className="h-6 w-6" />
          <span className="text-sm font-medium">Dark</span>
        </button>
        <button className="p-4 rounded-xl border border-border/40 hover:bg-muted/50 flex flex-col items-center gap-2">
          <Monitor className="h-6 w-6" />
          <span className="text-sm font-medium">System</span>
        </button>
      </div>
    </div>
  );
}
