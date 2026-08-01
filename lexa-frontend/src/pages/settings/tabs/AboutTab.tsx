import { Sparkles, ExternalLink, BookOpen, Bug, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">About & Help</h2>
        <p className="text-sm text-muted-foreground">Information, legal documents, and support.</p>
      </div>

      <div className="space-y-6">
        {/* App Info */}
        <section className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-border/40 bg-muted/10 text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-aurora flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xl gradient-text">Lexa AI Assistant</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Version 1.0.0 (Production build)</p>
          </div>
        </section>

        {/* Resources */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" className="h-14 justify-start gap-3 rounded-xl border-border/40 hover:bg-muted/50" onClick={() => window.open('#', '_blank')}>
            <BookOpen className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-sm">Documentation</p>
              <p className="text-xs text-muted-foreground font-normal">Learn how to use Lexa</p>
            </div>
          </Button>

          <Button variant="outline" className="h-14 justify-start gap-3 rounded-xl border-border/40 hover:bg-muted/50">
            <Bug className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <p className="font-semibold text-sm">Report a Bug</p>
              <p className="text-xs text-muted-foreground font-normal">Help us improve the app</p>
            </div>
          </Button>

          <Button variant="outline" className="h-14 justify-start gap-3 rounded-xl border-border/40 hover:bg-muted/50">
            <Mail className="h-5 w-5 text-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-sm">Contact Support</p>
              <p className="text-xs text-muted-foreground font-normal">Get help from our team</p>
            </div>
          </Button>

          <Button variant="outline" className="h-14 justify-start gap-3 rounded-xl border-border/40 hover:bg-muted/50">
            <Shield className="h-5 w-5 text-emerald-500" />
            <div className="text-left">
              <p className="font-semibold text-sm">Privacy & Terms</p>
              <p className="text-xs text-muted-foreground font-normal">Read our legal policies</p>
            </div>
          </Button>
        </section>
        
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            Built with ❤️ using React, Tailwind & Supabase <ExternalLink className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
