import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CreditCard,
  Download,
  Info,
  Languages,
  Lock,
  Menu,
  Palette,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type IconType = React.ComponentType<{ className?: string }>;

interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  isDanger?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const SETTINGS_GROUPS: NavGroup[] = [
  {
    label: "Account",
    items: [
      { id: "general", label: "General", icon: SlidersHorizontal },
      { id: "account", label: "Account", icon: UserCircle },
      { id: "security", label: "Security & Login", icon: ShieldCheck },
      { id: "privacy", label: "Privacy & Data", icon: Lock },
    ],
  },
  {
    label: "Preferences",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "personalization", label: "Personalization", icon: Sparkles },
      { id: "appearance", label: "Appearance", icon: Palette },
      { id: "language", label: "Language & Region", icon: Languages },
      { id: "accessibility", label: "Accessibility", icon: Accessibility },
    ],
  },
  {
    label: "Integrations & Billing",
    items: [
      { id: "integrations", label: "AI Providers", icon: Plug },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "export", label: "Data Export", icon: Download },
    ],
  },
  {
    label: "Support",
    items: [
      { id: "about", label: "About & Help", icon: Info },
      { id: "danger", label: "Danger Zone", icon: AlertTriangle, isDanger: true },
    ],
  },
];

const ALL_ITEMS: NavItem[] = SETTINGS_GROUPS.flatMap((group) => group.items);

interface SettingsLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

const NavButton = React.memo(function NavButton({
  item,
  active,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        active
          ? item.isDanger
            ? "text-destructive"
            : "text-foreground"
          : item.isDanger
            ? "text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {active ? (
        <motion.div
          layoutId="settings-active-pill"
          className={cn("absolute inset-0 rounded-lg", item.isDanger ? "bg-destructive/10" : "bg-primary/10")}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      ) : null}
      <Icon className="relative z-10 h-4 w-4" />
      <span className="relative z-10">{item.label}</span>
    </button>
  );
});

const SidebarNav = React.memo(function SidebarNav({
  currentTab,
  onSelect,
}: {
  currentTab: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="flex w-full flex-col gap-6">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavButton key={item.id} item={item} active={currentTab === item.id} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
});

export function SettingsLayout({ children, currentTab }: SettingsLayoutProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (tabId: string) => {
      navigate(`/settings?tab=${tabId}`, { replace: true });
      setMobileOpen(false);
    },
    [navigate],
  );

  const goToChat = React.useCallback(() => navigate("/chat"), [navigate]);

  const currentLabel = React.useMemo(
    () => ALL_ITEMS.find((item) => item.id === currentTab)?.label ?? "General",
    [currentTab],
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-background md:flex-row">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* Mobile header */}
      <header className="glass-strong sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 px-4 md:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goToChat} aria-label="Back to chat">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">Settings</span>
            <span className="text-[10px] text-muted-foreground">{currentLabel}</span>
          </div>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open settings menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass-strong w-[280px] p-4 sm:w-[320px]">
            <div className="mb-6 mt-4 text-lg font-semibold">Settings Menu</div>
            <div className="scrollbar-hide h-[calc(100vh-100px)] overflow-y-auto pb-10">
              <SidebarNav currentTab={currentTab} onSelect={handleSelect} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar */}
      <aside className="glass-card sticky top-0 hidden h-screen w-[280px] flex-col border-r border-border/40 md:flex lg:w-[320px]">
        <div className="flex items-center gap-4 p-6 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToChat}
            className="h-8 w-8 shrink-0 transition-transform hover:scale-105 active:scale-95"
            aria-label="Back to chat"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="gradient-text text-xl font-bold">Settings</h1>
        </div>
        <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
          <SidebarNav currentTab={currentTab} onSelect={handleSelect} />
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 h-[calc(100vh-64px)] w-full flex-1 overflow-y-auto md:h-screen">
        <div className="mx-auto max-w-3xl p-4 pb-24 md:p-8 lg:p-12">
          <nav className="mb-6 hidden items-center gap-2 text-sm text-muted-foreground md:flex" aria-label="Breadcrumb">
            <button onClick={goToChat} className="transition-colors hover:text-foreground">
              Chat
            </button>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-muted-foreground/60">Settings</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="font-medium text-foreground">{currentLabel}</span>
          </nav>
          <div key={currentTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}