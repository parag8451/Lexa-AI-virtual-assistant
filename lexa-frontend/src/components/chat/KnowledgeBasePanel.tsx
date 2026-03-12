import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Upload,
  Trash2,
  Search,
  File,
  FileType,
  BookOpen,
  Loader2,
  X,
} from "lucide-react";
import { useKnowledgeBase, KnowledgeDocument } from "@/hooks/useKnowledgeBase";
import { cn } from "@/lib/utils";

export function KnowledgeBasePanel() {
  const {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    searchDocuments,
  } = useKnowledgeBase();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filteredDocs = searchQuery ? searchDocuments(searchQuery) : documents;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadDocument(selectedFile, description);
    setSelectedFile(null);
    setDescription("");
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return FileType;
    if (fileType.includes("text")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Knowledge</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Knowledge Base
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Upload Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium">Upload Document</h4>
            
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload PDF, TXT, MD, or DOC
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Max 10MB
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Documents ({filteredDocs.length})
            </h4>
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs mt-1">
                    Upload documents to enhance Lexa's knowledge
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocs.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      document={doc}
                      onDelete={deleteDocument}
                      getFileIcon={getFileIcon}
                      formatFileSize={formatFileSize}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface DocumentItemProps {
  document: KnowledgeDocument;
  onDelete: (id: string) => void;
  getFileIcon: (type: string) => React.ComponentType<{ className?: string }>;
  formatFileSize: (bytes: number) => string;
}

function DocumentItem({ document, onDelete, getFileIcon, formatFileSize }: DocumentItemProps) {
  const Icon = getFileIcon(document.file_type);
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.name}</p>
        {document.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {document.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {formatFileSize(document.file_size)}
          </Badge>
          <Badge 
            variant={document.embedding_status === "completed" ? "default" : "secondary"}
            className={cn(
              "text-xs",
              document.embedding_status === "completed" && "bg-green-500/20 text-green-600"
            )}
          >
            {document.embedding_status === "completed" ? "Ready" : document.embedding_status}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
        onClick={() => onDelete(document.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
