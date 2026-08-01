import { useState } from "react";
import { Download, Upload, FileJson, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DataExportTab() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState("json");
  const [isExportDone, setIsExportDone] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setIsExportDone(false);
    
    // Mock export progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setIsExportDone(true);
          toast.success("Export complete! Check your email for the download link.");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleImport = () => {
    toast.info("Import feature requires a valid backup file. Please select a file first.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Data Export / Import</h2>
        <p className="text-sm text-muted-foreground">Manage, migrate, and backup your account data.</p>
      </div>
      
      <div className="space-y-6">
        {/* Export Section */}
        <section className="space-y-4">
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Account Data
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                Request a copy of your data (conversations, settings, and generated assets) in a GDPR-compliant format. Large exports may take a few minutes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (Machine readable)</SelectItem>
                    <SelectItem value="pdf">PDF (Readable document)</SelectItem>
                    <SelectItem value="txt">TXT (Plain text)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleExport} disabled={isExporting} className="self-end gap-2">
                {isExporting ? "Processing..." : "Request Export"}
              </Button>
            </div>

            {isExporting && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Preparing your data...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            {isExportDone && (
              <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
                <span>Your data export is ready. A download link has been sent to your email.</span>
              </div>
            )}
          </div>
        </section>

        {/* Import Section */}
        <section className="space-y-4">
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" /> Import Conversations
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                Migrating from another tool like ChatGPT or an older account? Upload your exported JSON file here.
              </p>
            </div>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-background hover:bg-muted/50 border-border/40 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileJson className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON files only (MAX. 50MB)</p>
                </div>
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
