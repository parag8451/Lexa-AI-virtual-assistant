import { Menu, X, Globe, Download, Keyboard, MoreVertical, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { PersonalitySelector, getPersonalityPrompt } from "./PersonalitySelector";
import { SearchModelSelector } from "./SearchModelSelector";
import { PersonalizationHub } from "./PersonalizationHub";
import { KnowledgeBasePanel } from "./KnowledgeBasePanel";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { AgentsPanel } from "./AgentsPanel";
import { GoalsPanel } from "./GoalsPanel";
import { ScheduledTasksPanel } from "./ScheduledTasksPanel";
import { MediaGenerationPanel } from "./MediaGenerationPanel";
import { WorkspacePanel } from "./WorkspacePanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { MobileFeatureMenu } from "./MobileFeatureMenu";
import { NotificationCenter } from "./NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PersonalityType } from "@/hooks/useUserPreferences";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  isStreaming: boolean;
  webSearchEnabled: boolean;
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  onExport: () => void;
  onShowShortcuts: () => void;
  hasMessages: boolean;
  personality?: PersonalityType;
  onPersonalityChange?: (p: PersonalityType) => void;
  searchModel?: string;
  onSearchModelChange?: (m: string) => void;
  searchCooldown?: number;
  onUseTemplate?: (content: string) => void;
  autoRouting?: boolean;
  onAutoRoutingChange?: (enabled: boolean) => void;
}

export function ChatHeader({
  selectedModel,
  onModelChange,
  isStreaming,
  webSearchEnabled,
  mobileSidebarOpen,
  onToggleMobileSidebar,
  onExport,
  onShowShortcuts,
  hasMessages,
  personality = "friendly",
  onPersonalityChange,
  searchModel = "lexa-search-fast",
  onSearchModelChange,
  searchCooldown = 0,
  onUseTemplate,
  autoRouting = true,
  onAutoRoutingChange,
}: ChatHeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-14 items-center justify-between border-b border-border/20 px-4 glass-strong"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-muted/50 rounded-lg"
          onClick={onToggleMobileSidebar}
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          disabled={isStreaming}
        />

        {onPersonalityChange && (
          <PersonalitySelector
            value={personality}
            onChange={onPersonalityChange}
            disabled={isStreaming}
          />
        )}

        {/* Personalization Hub - Memory, Instructions, Templates */}
        <PersonalizationHub onUseTemplate={onUseTemplate} />
        
        {/* Divider */}
        <div className="h-5 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent mx-1 hidden md:block" />
        
        {/* All Feature Panels */}
        <div className="hidden md:flex items-center gap-0.5">
          <KnowledgeBasePanel />
          <ArtifactsPanel conversationId={undefined} />
          <AgentsPanel />
          <GoalsPanel />
          <ScheduledTasksPanel />
          <MediaGenerationPanel />
          <WorkspacePanel />
          <AnalyticsPanel />
        </div>
        {/* Mobile Feature Menu */}
        <MobileFeatureMenu />
      </div>

      <div className="flex items-center gap-2">
        {webSearchEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shadow-sm">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline font-medium">Web Search</span>
            </div>
            {onSearchModelChange && (
              <SearchModelSelector
                value={searchModel}
                onChange={onSearchModelChange}
                disabled={isStreaming}
                cooldownRemaining={searchCooldown}
              />
            )}
          </motion.div>
        )}

        {/* Notification Center */}
        <NotificationCenter />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted/50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56 glass-strong border-border/30 shadow-xl z-50">
            <DropdownMenuItem onClick={onExport} disabled={!hasMessages} className="rounded-lg">
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem onClick={onShowShortcuts} className="rounded-lg">
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            {onAutoRoutingChange && (
              <>
                <DropdownMenuSeparator className="bg-border/30" />
                <DropdownMenuItem 
                  onClick={() => onAutoRoutingChange(!autoRouting)}
                  className="flex items-center justify-between rounded-lg"
                >
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto Model Routing
                  </span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                    autoRouting ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {autoRouting ? "ON" : "OFF"}
                  </span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

export { getPersonalityPrompt };
