import { useState } from "react";
import { Globe, Clock, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LanguageTab() {
  const [interfaceLanguage, setInterfaceLanguage] = useState("en");
  const [aiLanguage, setAiLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [currency, setCurrency] = useState("USD");

  const handleSave = (key: string, value: string, message: string) => {
    // Mock save
    toast.success(message);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Language & Region</h2>
        <p className="text-sm text-muted-foreground">Manage your locale, time formats, and currency.</p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Languages</h3>
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-[70%]">
                <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Interface Language</Label>
                <p className="text-xs text-muted-foreground">The language used for buttons, menus, and UI elements.</p>
              </div>
              <Select value={interfaceLanguage} onValueChange={(v) => { setInterfaceLanguage(v); handleSave("interface", v, "Interface language updated"); }}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="es">Español (ES)</SelectItem>
                  <SelectItem value="fr">Français (FR)</SelectItem>
                  <SelectItem value="de">Deutsch (DE)</SelectItem>
                  <SelectItem value="ja">日本語 (JA)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-[70%]">
                <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> AI Response Language</Label>
                <p className="text-xs text-muted-foreground">Force the AI to respond in this language regardless of UI settings.</p>
              </div>
              <Select value={aiLanguage} onValueChange={(v) => { setAiLanguage(v); handleSave("ai", v, "AI language preference updated"); }}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </section>

        {/* Region Settings */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Region Formats</h3>
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-[70%]">
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Date & Time Format</Label>
                <p className="text-xs text-muted-foreground">How dates are displayed in your chat history.</p>
              </div>
              <Select value={dateFormat} onValueChange={(v) => { setDateFormat(v); handleSave("date", v, "Date format updated"); }}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12hr)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (24hr)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-[70%]">
                <Label className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Default Currency</Label>
                <p className="text-xs text-muted-foreground">Used for billing and subscription displays.</p>
              </div>
              <Select value={currency} onValueChange={(v) => { setCurrency(v); handleSave("currency", v, "Currency updated"); }}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
