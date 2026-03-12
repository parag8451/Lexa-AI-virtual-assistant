import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileText, FileCode, Check, Sparkles } from "lucide-react";
import type { Message } from "@/types/chat";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  title: string;
}

export function ExportDialog({ open, onOpenChange, messages, title }: ExportDialogProps) {
  const [format, setFormat] = useState<"markdown" | "json" | "txt">("markdown");
  const [isExporting, setIsExporting] = useState(false);

  const exportChat = () => {
    setIsExporting(true);
    
    let content = "";
    let filename = `${title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}`;
    let mimeType = "text/plain";

    try {
      switch (format) {
        case "markdown":
          content = `# ${title}\n\nExported on ${new Date().toLocaleString()}\n\n---\n\n`;
          messages.forEach((msg) => {
            const role = msg.role === "user" ? "**You**" : "**Lexa AI**";
            content += `${role}\n\n${msg.content}\n\n---\n\n`;
          });
          filename += ".md";
          mimeType = "text/markdown";
          break;

        case "json":
          content = JSON.stringify(
            {
              title,
              exportedAt: new Date().toISOString(),
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.created_at,
              })),
            },
            null,
            2
          );
          filename += ".json";
          mimeType = "application/json";
          break;

        case "txt":
          content = `${title}\nExported on ${new Date().toLocaleString()}\n\n`;
          messages.forEach((msg) => {
            const role = msg.role === "user" ? "You" : "Lexa AI";
            content += `[${role}]\n${msg.content}\n\n`;
          });
          filename += ".txt";
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Chat exported successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to export chat");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-gradient-to-b from-background/98 to-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Download className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Export Chat</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-5">
            Choose a format to export your conversation
          </p>
          
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as typeof format)}>
            <div className="space-y-3">
              {[
                { value: "markdown", icon: FileText, color: "blue", label: "Markdown", desc: "Best for documentation" },
                { value: "json", icon: FileCode, color: "green", label: "JSON", desc: "For developers & backups" },
                { value: "txt", icon: FileText, color: "orange", label: "Plain Text", desc: "Simple & universal" },
              ].map((option, index) => {
                const Icon = option.icon;
                const isSelected = format === option.value;
                return (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-300",
                      "border",
                      isSelected
                        ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/10"
                        : "bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border"
                    )}
                    onClick={() => setFormat(option.value as typeof format)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      option.color === "blue" && "bg-blue-500/20 text-blue-500",
                      option.color === "green" && "bg-green-500/20 text-green-500",
                      option.color === "orange" && "bg-orange-500/20 text-orange-500"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </Label>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/50">
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={exportChat} 
              disabled={isExporting || messages.length === 0}
              className="rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
