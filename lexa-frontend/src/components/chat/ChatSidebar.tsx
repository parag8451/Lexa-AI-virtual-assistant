import { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

// Conversation item component with forwardRef to fix React warning
interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onStartEdit: (conv: Conversation) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isCollapsed: boolean;
}

const ConversationItem = forwardRef<HTMLDivElement, ConversationItemProps>(
  (
    {
      conv,
      isActive,
      isEditing,
      editTitle,
      onEditTitleChange,
      onSaveEdit,
      onCancelEdit,
      onStartEdit,
      onSelect,
      onDelete,
      isCollapsed,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200",
          isActive
            ? "bg-primary/10 text-foreground border border-primary/20 shadow-sm"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onSelect(conv.id)}
      >
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="h-7 text-sm bg-muted/50 border-border/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit(conv.id);
                if (e.key === "Escape") onCancelEdit();
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-green-500/20 hover:text-green-500"
              onClick={() => onSaveEdit(conv.id)}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-red-500/20 hover:text-red-500"
              onClick={onCancelEdit}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <MessageSquare className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">{conv.title}</span>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-muted/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(conv);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    );
  }
);

ConversationItem.displayName = "ConversationItem";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onSignOut: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onSignOut,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const dateKey = formatDate(conv.updated_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 68 : 288 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full glass-strong border-r border-border/30"
    >
      {/* Header */}
      <div className="p-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <span className="font-bold text-foreground truncate">Lexa AI</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="shrink-0 h-8 w-8 hover:bg-muted/50 rounded-lg"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* New chat button */}
        <motion.div layout>
          <Button
            onClick={onNewChat}
            className={cn(
              "mt-3 w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl font-semibold",
              isCollapsed && "px-2"
            )}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">New Chat</span>}
          </Button>
        </motion.div>

        {/* Search */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-3"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/30 border-border/20 rounded-lg text-sm focus-visible:ring-primary/30"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 chat-scrollbar">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedConversations).map(([date, convs]) => (
              <motion.div
                key={date}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4"
              >
                {!isCollapsed && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    {date}
                  </p>
                )}
                <div className="space-y-1">
                  {convs.map((conv) => (
                    <Tooltip key={conv.id}>
                      <TooltipTrigger asChild>
                        <ConversationItem
                          conv={conv}
                          isActive={currentConversationId === conv.id}
                          isEditing={editingId === conv.id}
                          editTitle={editTitle}
                          onEditTitleChange={setEditTitle}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onStartEdit={handleStartEdit}
                          onSelect={onSelectConversation}
                          onDelete={onDeleteConversation}
                          isCollapsed={isCollapsed}
                        />
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="glass-strong">
                          {conv.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredConversations.length === 0 && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 text-muted-foreground"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/30 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">No conversations</p>
              <p className="text-xs mt-1 text-muted-foreground/60">Start a new chat to begin</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/20">
        <div className={cn("flex gap-2", isCollapsed ? "flex-col items-center" : "")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "h-9 rounded-xl hover:bg-muted/50 transition-all",
                  !isCollapsed && "flex-1 justify-start gap-2"
                )}
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
                {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right" className="glass-strong">Settings</TooltipContent>}
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "h-9 rounded-xl hover:bg-muted/50 transition-all",
                  !isCollapsed && "flex-1 justify-start gap-2"
                )}
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right" className="glass-strong">Sign Out</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
