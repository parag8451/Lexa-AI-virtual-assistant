import { useState } from "react";
import { Brain, Trash2, Plus, Tag, Star, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";
import { Memory, MemoryType, useMemories } from "@/hooks/useMemories";
import { formatDistanceToNow } from "date-fns";

interface MemoryPanelProps {
  children?: React.ReactNode;
}

const MEMORY_TYPE_COLORS: Record<MemoryType, { bg: string; text: string }> = {
  preference: { bg: "bg-blue-500/10", text: "text-blue-500" },
  fact: { bg: "bg-green-500/10", text: "text-green-500" },
  context: { bg: "bg-purple-500/10", text: "text-purple-500" },
  conversation_summary: { bg: "bg-amber-500/10", text: "text-amber-500" },
  interest: { bg: "bg-pink-500/10", text: "text-pink-500" },
  style: { bg: "bg-cyan-500/10", text: "text-cyan-500" },
};

export function MemoryPanel({ children }: MemoryPanelProps) {
  const { memories, isLoading, addMemory, deleteMemory, clearAllMemories } = useMemories();
  const [isOpen, setIsOpen] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [newMemoryType, setNewMemoryType] = useState<MemoryType>("fact");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;
    
    setIsAdding(true);
    await addMemory(newMemory.trim(), newMemoryType);
    setNewMemory("");
    setShowAddForm(false);
    setIsAdding(false);
  };

  const groupedMemories = memories.reduce((acc, mem) => {
    const type = mem.memory_type as MemoryType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(mem);
    return acc;
  }, {} as Record<MemoryType, Memory[]>);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 rounded-xl">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Memory</span>
            {memories.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {memories.length}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Lexa's Memory
          </SheetTitle>
          <SheetDescription>
            Things Lexa remembers about you across all conversations
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Add memory button/form */}
          {showAddForm ? (
            <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
              <Input
                placeholder="Add something for Lexa to remember..."
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {(Object.keys(MEMORY_TYPE_COLORS) as MemoryType[]).map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all",
                      newMemoryType === type && MEMORY_TYPE_COLORS[type].bg,
                      newMemoryType === type && MEMORY_TYPE_COLORS[type].text
                    )}
                    onClick={() => setNewMemoryType(type)}
                  >
                    {type.replace("_", " ")}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddMemory}
                  disabled={!newMemory.trim() || isAdding}
                  className="flex-1"
                >
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Memory"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Memory Manually
            </Button>
          )}

          {/* Memory list */}
          <ScrollArea className="h-[calc(100vh-320px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No memories yet</p>
                <p className="text-sm mt-1">
                  Lexa will learn about you as you chat
                </p>
              </div>
            ) : (
              <div className="space-y-6 pr-4">
                {(Object.entries(groupedMemories) as [MemoryType, Memory[]][]).map(([type, mems]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className={cn("h-3 w-3", MEMORY_TYPE_COLORS[type].text)} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {type.replace("_", " ")}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {mems.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {mems.map((memory) => (
                        <div
                          key={memory.id}
                          className={cn(
                            "group p-3 rounded-lg border transition-all",
                            "hover:border-primary/30 hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <p className="flex-1 text-sm">{memory.content}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => deleteMemory(memory.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {memory.importance}/10
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Clear all */}
          {memories.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Memories
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all memories?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {memories.length} memories. Lexa will no longer remember anything about you. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAllMemories}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
