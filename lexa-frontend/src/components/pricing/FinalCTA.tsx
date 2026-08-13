import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-background border-t border-border/20">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute w-[800px] h-[300px] bg-indigo-500/10 rounded-[100%] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
          Ready to get more out of AI?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Start with the plan that fits your workflow. Upgrade whenever you need more power.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 text-base font-semibold w-full sm:w-auto">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold w-full sm:w-auto">
            <a href="#pricing" onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}>
              View Plans
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
