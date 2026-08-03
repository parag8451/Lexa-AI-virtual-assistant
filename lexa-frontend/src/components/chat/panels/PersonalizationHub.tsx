import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Settings, Sparkles, ChevronRight, X, 
  Plus, Trash2, Edit2, Save, Power, Star, Clock, Tag,
  Heart, Search, Play, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
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
import { useMemories, Memory, MemoryType } from "@/hooks/useMemories";
import { useCustomInstructions, CustomInstruction } from "@/hooks/useCustomInstructions";
import { useSmartTemplates, SmartTemplate, TEMPLATE_CATEGORIES } from "@/hooks/useSmartTemplates";
import { formatDistanceToNow } from "date-fns";

interface PersonalizationHubProps {
  onUseTemplate?: (content: string) => void;
}

type ActivePanel = "hub" | "memory" | "instructions" | "templates";

const MEMORY_TYPE_COLORS: Record<MemoryType, { bg: string; text: string; border: string }> = {
  preference: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  fact: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
  context: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  conversation_summary: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  interest: { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/30" },
  style: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/30" },
};

// Feature Card Component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  count, 
  gradient, 
  onClick 
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count?: number;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full p-5 rounded-2xl text-left",
        "border border-border/50 bg-card",
        "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 group overflow-hidden"
      )}
    >
      {/* Gradient background on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-br", gradient
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br shadow-lg", gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-xs font-medium">
              {count}
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
          <span>Manage</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.button>
  );
}

// Memory Panel Content
function MemoryPanelContent({ onBack }: { onBack: () => void }) {
  const { memories, isLoading, addMemory, deleteMemory, clearAllMemories } = useMemories();
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b bg-gradient-to-r from-violet-500/10 to-purple-500/10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-500" />
            Lexa's Memory
          </h2>
          <p className="text-sm text-muted-foreground">
            {memories.length} memories stored
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Add memory */}
        {showAddForm ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-3"
          >
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
                    "cursor-pointer transition-all capitalize",
                    newMemoryType === type && MEMORY_TYPE_COLORS[type].bg,
                    newMemoryType === type && MEMORY_TYPE_COLORS[type].text,
                    newMemoryType === type && MEMORY_TYPE_COLORS[type].border
                  )}
                  onClick={() => setNewMemoryType(type)}
                >
                  {type.replace("_", " ")}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMemory} disabled={!newMemory.trim() || isAdding} className="flex-1">
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Memory"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Memory Manually
          </Button>
        )}

        {/* Memory list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No memories yet</p>
            <p className="text-sm mt-1">Lexa will learn about you as you chat</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(Object.entries(groupedMemories) as [MemoryType, Memory[]][]).map(([type, mems]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-2 h-2 rounded-full", MEMORY_TYPE_COLORS[type].bg.replace("/10", ""))} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {type.replace("_", " ")}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{mems.length}</Badge>
                </div>
                <div className="space-y-2">
                  {mems.map((memory) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "group p-4 rounded-xl border transition-all",
                        "hover:border-primary/30 hover:bg-accent/50",
                        MEMORY_TYPE_COLORS[type].border.replace("/30", "/20")
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <p className="flex-1 text-sm">{memory.content}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => deleteMemory(memory.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {memories.length > 0 && (
        <div className="p-4 border-t">
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
                  This will permanently delete all {memories.length} memories. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllMemories} className="bg-destructive text-destructive-foreground">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

// Instructions Panel Content
function InstructionsPanelContent({ onBack }: { onBack: () => void }) {
  const { instructions, isLoading, activeCount, addInstruction, updateInstruction, deleteInstruction, toggleInstruction } = useCustomInstructions();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleAdd = async () => {
    if (!newName.trim() || !newContent.trim()) return;
    await addInstruction(newName.trim(), newContent.trim());
    setNewName("");
    setNewContent("");
    setIsAdding(false);
  };

  const handleEdit = (instruction: CustomInstruction) => {
    setEditingId(instruction.id);
    setEditName(instruction.name);
    setEditContent(instruction.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim() || !editContent.trim()) return;
    await updateInstruction(editingId, { name: editName.trim(), content: editContent.trim() });
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Custom Instructions
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active instruction{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Add instruction form */}
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-3"
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Instruction name (e.g., 'Always use bullet points')"
              className="font-medium"
            />
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What should Lexa always do?"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || !newContent.trim()} className="flex-1">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setIsAdding(false); setNewName(""); setNewContent(""); }}>
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
            Add Instruction
          </Button>
        )}

        {/* Instructions list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : instructions.length === 0 && !isAdding ? (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No custom instructions yet</p>
            <p className="text-sm mt-1">Add rules for Lexa to follow</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {instructions.map((instruction) => (
              <motion.div
                key={instruction.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  instruction.is_active 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-border bg-muted/30 opacity-60"
                )}
              >
                {editingId === instruction.id ? (
                  <div className="space-y-3">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Instruction name" className="font-medium" />
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="What should Lexa always do?" rows={3} />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{instruction.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{instruction.content}</p>
                      </div>
                      <Switch
                        checked={instruction.is_active}
                        onCheckedChange={() => toggleInstruction(instruction.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleEdit(instruction)}>
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteInstruction(instruction.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Templates Panel Content
function TemplatesPanelContent({ onBack, onUseTemplate }: { onBack: () => void; onUseTemplate?: (content: string) => void }) {
  const { templates, isLoading, getByCategory, fillTemplate, useTemplate, toggleFavorite, deleteTemplate } = useSmartTemplates();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<SmartTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const filteredTemplates = getByCategory(activeCategory).filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query);
  });

  const handleSelectTemplate = (template: SmartTemplate) => {
    setSelectedTemplate(template);
    const initial: Record<string, string> = {};
    template.variables.forEach(v => { initial[v.name] = v.defaultValue || ""; });
    setVariableValues(initial);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate || !onUseTemplate) return;
    const filledContent = fillTemplate(selectedTemplate, variableValues);
    await useTemplate(selectedTemplate.id);
    onUseTemplate(filledContent);
    setSelectedTemplate(null);
    setVariableValues({});
  };

  const handleQuickUse = async (template: SmartTemplate) => {
    if (template.variables.length === 0 && onUseTemplate) {
      await useTemplate(template.id);
      onUseTemplate(template.content);
    } else {
      handleSelectTemplate(template);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Smart Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            {templates.length} templates available
          </p>
        </div>
      </div>

      {selectedTemplate ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
              {selectedTemplate.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedTemplate.variables.length > 0 && (
            <div className="space-y-4 bg-muted/30 rounded-xl p-4">
              <Label className="text-sm font-medium">Fill in the blanks:</Label>
              {selectedTemplate.variables.map((variable) => (
                <div key={variable.name} className="space-y-1.5">
                  <Label htmlFor={variable.name} className="text-xs text-muted-foreground">
                    {variable.description || variable.name}
                  </Label>
                  <Input
                    id={variable.name}
                    value={variableValues[variable.name] || ""}
                    onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                    placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview:</Label>
            <div className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap font-mono">
              {fillTemplate(selectedTemplate, variableValues)}
            </div>
          </div>

          <Button onClick={handleUseTemplate} className="w-full gap-2" size="lg" disabled={!onUseTemplate}>
            <Play className="h-4 w-4" />
            Use Template
          </Button>
        </div>
      ) : (
        <>
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {TEMPLATE_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "secondary" : "ghost"}
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No templates found</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="border rounded-xl p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group"
                    onClick={() => handleQuickUse(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{template.name}</h4>
                          {template.is_favorite && <Heart className="h-3 w-3 text-red-500 fill-red-500" />}
                        </div>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px] h-5">{template.category}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">Used {template.usage_count}x</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}>
                          <Heart className={cn("h-3.5 w-3.5", template.is_favorite ? "text-red-500 fill-red-500" : "")} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Main Personalization Hub Component
export function PersonalizationHub({ onUseTemplate }: PersonalizationHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("hub");
  
  const { memories } = useMemories();
  const { activeCount } = useCustomInstructions();
  const { templates } = useSmartTemplates();

  const totalCount = memories.length + activeCount + templates.length;

  const handleBack = () => setActivePanel("hub");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setActivePanel("hub"); }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 rounded-xl">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Personalize</span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {totalCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activePanel === "hub" ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <SheetHeader className="p-6 border-b bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg">Personalization Hub</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      Customize how Lexa works for you
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <FeatureCard
                  icon={Brain}
                  title="Memory"
                  description="Things Lexa remembers about you across all conversations"
                  count={memories.length}
                  gradient="from-violet-500 to-purple-600"
                  onClick={() => setActivePanel("memory")}
                />
                
                <FeatureCard
                  icon={Settings}
                  title="Custom Instructions"
                  description="Add persistent rules that Lexa will follow in all conversations"
                  count={activeCount}
                  gradient="from-blue-500 to-cyan-500"
                  onClick={() => setActivePanel("instructions")}
                />
                
                <FeatureCard
                  icon={Sparkles}
                  title="Smart Templates"
                  description="Reusable prompts to speed up common tasks"
                  count={templates.length}
                  gradient="from-amber-500 to-orange-500"
                  onClick={() => setActivePanel("templates")}
                />
              </div>
            </motion.div>
          ) : activePanel === "memory" ? (
            <motion.div
              key="memory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <MemoryPanelContent onBack={handleBack} />
            </motion.div>
          ) : activePanel === "instructions" ? (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <InstructionsPanelContent onBack={handleBack} />
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <TemplatesPanelContent onBack={handleBack} onUseTemplate={onUseTemplate} />
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
