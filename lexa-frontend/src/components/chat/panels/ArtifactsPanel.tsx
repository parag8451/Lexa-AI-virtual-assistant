import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PanelRight,
  Code,
  FileText,
  Table,
  ImageIcon,
  Pin,
  PinOff,
  Trash2,
  Copy,
  Download,
  Plus,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useArtifacts, Artifact } from "@/hooks/useArtifacts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Simple syntax highlighting component
function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
      <code>{code}</code>
    </pre>
  );
}

export function ArtifactsPanel({ conversationId }: { conversationId?: string }) {
  const {
    artifacts,
    isLoading,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    togglePin,
    getConversationArtifacts,
    getPinnedArtifacts,
  } = useArtifacts();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pinned" | "conversation">("all");
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newArtifact, setNewArtifact] = useState({
    title: "",
    content: "",
    type: "code" as Artifact["artifact_type"],
    language: "javascript",
  });

  const displayArtifacts = activeTab === "pinned" 
    ? getPinnedArtifacts()
    : activeTab === "conversation" && conversationId
    ? getConversationArtifacts(conversationId)
    : artifacts;

  const handleCreate = async () => {
    if (!newArtifact.title.trim() || !newArtifact.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    const artifact = await createArtifact(
      newArtifact.title,
      newArtifact.content,
      newArtifact.type,
      newArtifact.language,
      conversationId
    );

    if (artifact) {
      setIsCreating(false);
      setNewArtifact({ title: "", content: "", type: "code", language: "javascript" });
      setSelectedArtifact(artifact);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedArtifact) return;
    
    const success = await updateArtifact(selectedArtifact.id, { content: editContent });
    if (success) {
      setSelectedArtifact({ ...selectedArtifact, content: editContent });
      setIsEditing(false);
    }
  };

  const handleCopy = () => {
    if (!selectedArtifact) return;
    navigator.clipboard.writeText(selectedArtifact.content);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    if (!selectedArtifact) return;
    const blob = new Blob([selectedArtifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedArtifact.title}.${selectedArtifact.language || "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: Artifact["artifact_type"]) => {
    switch (type) {
      case "code": return Code;
      case "document": return FileText;
      case "table": return Table;
      case "image": return ImageIcon;
      default: return FileText;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <PanelRight className="h-4 w-4" />
          <span className="hidden sm:inline">Artifacts</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r flex flex-col">
            <div className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2 mb-4">
                <PanelRight className="h-5 w-5 text-primary" />
                Artifacts
              </SheetTitle>
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => {
                  setIsCreating(true);
                  setSelectedArtifact(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Artifact
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full grid grid-cols-3 m-2 mr-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="pinned" className="text-xs">Pinned</TabsTrigger>
                <TabsTrigger value="conversation" className="text-xs">Chat</TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : displayArtifacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No artifacts</p>
                  </div>
                ) : (
                  displayArtifacts.map((artifact) => {
                    const Icon = getTypeIcon(artifact.artifact_type);
                    return (
                      <button
                        key={artifact.id}
                        onClick={() => {
                          setSelectedArtifact(artifact);
                          setIsCreating(false);
                          setIsEditing(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                          selectedArtifact?.id === artifact.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm truncate flex-1">{artifact.title}</span>
                        {artifact.is_pinned && (
                          <Pin className="h-3 w-3 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {isCreating ? (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold">Create New Artifact</h3>
                <Input
                  placeholder="Title"
                  value={newArtifact.title}
                  onChange={(e) => setNewArtifact(prev => ({ ...prev, title: e.target.value }))}
                />
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newArtifact.type}
                    onChange={(e) => setNewArtifact(prev => ({ 
                      ...prev, 
                      type: e.target.value as Artifact["artifact_type"] 
                    }))}
                  >
                    <option value="code">Code</option>
                    <option value="document">Document</option>
                    <option value="table">Table</option>
                  </select>
                  {newArtifact.type === "code" && (
                    <Input
                      placeholder="Language"
                      value={newArtifact.language}
                      onChange={(e) => setNewArtifact(prev => ({ ...prev, language: e.target.value }))}
                    />
                  )}
                </div>
                <Textarea
                  placeholder="Content..."
                  value={newArtifact.content}
                  onChange={(e) => setNewArtifact(prev => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreate}>Create</Button>
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </div>
            ) : selectedArtifact ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedArtifact.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {selectedArtifact.artifact_type}
                      </Badge>
                      {selectedArtifact.language && (
                        <Badge variant="outline" className="text-xs">
                          {selectedArtifact.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(selectedArtifact.id)}
                  >
                    {selectedArtifact.is_pinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditContent(selectedArtifact.content);
                        setIsEditing(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      deleteArtifact(selectedArtifact.id);
                      setSelectedArtifact(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 p-4">
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="font-mono text-sm min-h-[400px]"
                    />
                  ) : selectedArtifact.artifact_type === "code" ? (
                    <CodeBlock 
                      code={selectedArtifact.content} 
                      language={selectedArtifact.language || undefined} 
                    />
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {selectedArtifact.content}
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PanelRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an artifact to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
