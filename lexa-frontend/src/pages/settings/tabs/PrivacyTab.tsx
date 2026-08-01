import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function PrivacyTab() {
  const [improveModel, setImproveModel] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Privacy & Data Controls</h2>
        <p className="text-sm text-muted-foreground">Manage how your data is used and stored.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="space-y-1 max-w-[80%]">
                <Label className="text-sm font-medium">Use my conversations to improve models</Label>
                <p className="text-xs text-muted-foreground">
                  Allow your chat history to be reviewed and used to train future AI models. Turning this off does not delete existing data.
                </p>
              </div>
              <Switch checked={improveModel} onCheckedChange={(v) => { setImproveModel(v); toast.success("Privacy preferences updated"); }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 max-w-[80%]">
                <Label className="text-sm font-medium">Save chat history</Label>
                <p className="text-xs text-muted-foreground">
                  Save your past conversations so you can continue them later.
                </p>
              </div>
              <Switch checked={saveHistory} onCheckedChange={(v) => { setSaveHistory(v); toast.success("History preferences updated"); }} />
            </div>
            
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Clear Data</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-border/40 bg-muted/10 gap-4">
            <div>
              <p className="text-sm font-medium">Clear all conversations</p>
              <p className="text-xs text-muted-foreground mt-1">This will permanently delete all your chats.</p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-strong border-border/30 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your chat history will be permanently deleted across all devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.success("All conversations deleted")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </div>
  );
}
