import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Plus, Trash2, GripVertical, Power, PowerOff,
  ChevronDown, ChevronUp, Edit2, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCustomInstructions, CustomInstruction } from "@/hooks/useCustomInstructions";
import { cn } from "@/lib/utils";

export function CustomInstructionsPanel() {
  const { 
    instructions, 
    isLoading, 
    activeCount,
    addInstruction, 
    updateInstruction, 
    deleteInstruction,
    toggleInstruction 
  } = useCustomInstructions();

  const [isOpen, setIsOpen] = useState(false);
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
    
    await updateInstruction(editingId, { 
      name: editName.trim(), 
      content: editContent.trim() 
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditContent("");
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Instructions</span>
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Custom Instructions
          </DialogTitle>
          <DialogDescription>
            Add persistent rules that Lexa will follow in all conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {/* Existing instructions */}
          <AnimatePresence mode="popLayout">
            {instructions.map((instruction) => (
              <motion.div
                key={instruction.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "border rounded-xl p-4 transition-colors",
                  instruction.is_active 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-border bg-muted/30 opacity-60"
                )}
              >
                {editingId === instruction.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Instruction name"
                      className="font-medium"
                    />
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="What should Lexa always do?"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{instruction.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {instruction.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={instruction.is_active}
                          onCheckedChange={() => toggleInstruction(instruction.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => handleEdit(instruction)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => deleteInstruction(instruction.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {instructions.length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No custom instructions yet</p>
              <p className="text-xs mt-1">Add rules for Lexa to follow</p>
            </div>
          )}

          {/* Add new instruction form */}
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-dashed border-primary/50 rounded-xl p-4 space-y-3 bg-primary/5"
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
                placeholder="What should Lexa always do? (e.g., 'Format all responses using bullet points for easier reading.')"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                    setNewContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newContent.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {!isAdding && (
            <Button 
              onClick={() => setIsAdding(true)} 
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Instruction
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
