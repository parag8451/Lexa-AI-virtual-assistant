import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Shield, Lock, Bell, Sparkles, Link2, CreditCard, Download, 
  Palette, Globe, Accessibility, HelpCircle, AlertOctagon, ArrowLeft,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SettingsLayoutProps {
  children: ReactNode;
  currentTab: string;
}

const SETTINGS_SECTIONS = [
  { id: "general", label: "General", icon: User },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security & Login", icon: Shield },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "personalization", label: "Personalization", icon: Sparkles },
  { id: "integrations", label: "Connected Apps", icon: Link2 },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "export", label: "Data Export / Import", icon: Download },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "about", label: "About & Help", icon: HelpCircle },
  { id: "danger", label: "Danger Zone", icon: AlertOctagon, isDanger: true },
];

export function SettingsLayout({ children, currentTab }: SettingsLayoutProps) {
  const navigate = useNavigate();

  const handleTabChange = (tabId: string) => {
    navigate(`/settings?tab=${tabId}`, { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col gap-1 w-full">
      {SETTINGS_SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => handleTabChange(section.id)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left",
            currentTab === section.id
              ? section.isDanger
                ? "bg-destructive/10 text-destructive dark:text-red-400"
                : "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            section.isDanger && currentTab !== section.id && "hover:text-destructive hover:bg-destructive/5"
          )}
        >
          <section.icon className="h-4 w-4" />
          {section.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 glass-strong border-b border-border/40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">Settings</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-4 glass-strong">
            <div className="mb-6 mt-4 font-semibold text-lg">Settings Menu</div>
            <div className="overflow-y-auto h-[calc(100vh-100px)] pb-10 scrollbar-hide">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] border-r border-border/40 h-screen sticky top-0 glass-card">
        <div className="p-6 pb-2 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold gradient-text">Settings</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <SidebarContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-3xl mx-auto p-4 md:p-8 lg:p-12 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
