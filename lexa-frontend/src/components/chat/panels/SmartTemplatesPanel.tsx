import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Plus, Trash2, Heart, Search, Code, PenTool, 
  GraduationCap, Target, Layers, Mail, FileText, Bug, Lightbulb,
  Play, Edit2, Star, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSmartTemplates, SmartTemplate, TEMPLATE_CATEGORIES } from "@/hooks/useSmartTemplates";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Code, PenTool, GraduationCap, Target, Layers, Mail, FileText, Bug, Lightbulb, Star
};

interface SmartTemplatesPanelProps {
  onUseTemplate: (content: string) => void;
}

export function SmartTemplatesPanel({ onUseTemplate }: SmartTemplatesPanelProps) {
  const { 
    templates, 
    isLoading, 
    favorites,
    getByCategory,
    fillTemplate,
    addTemplate,
    deleteTemplate,
    useTemplate,
    toggleFavorite 
  } = useSmartTemplates();

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<SmartTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Filter templates by search and category
  const filteredTemplates = useMemo(() => {
    let filtered = getByCategory(activeCategory);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [getByCategory, activeCategory, searchQuery]);

  const handleSelectTemplate = (template: SmartTemplate) => {
    setSelectedTemplate(template);
    // Initialize variable values with defaults
    const initial: Record<string, string> = {};
    template.variables.forEach(v => {
      initial[v.name] = v.defaultValue || "";
    });
    setVariableValues(initial);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;
    
    const filledContent = fillTemplate(selectedTemplate, variableValues);
    await useTemplate(selectedTemplate.id);
    onUseTemplate(filledContent);
    setIsOpen(false);
    setSelectedTemplate(null);
    setVariableValues({});
  };

  const handleQuickUse = async (template: SmartTemplate) => {
    if (template.variables.length === 0) {
      await useTemplate(template.id);
      onUseTemplate(template.content);
      setIsOpen(false);
    } else {
      handleSelectTemplate(template);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = ICONS[iconName] || Sparkles;
    return Icon;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-hidden flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Templates
          </SheetTitle>
          <SheetDescription>
            Reusable prompts to speed up common tasks
          </SheetDescription>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Template Detail View */}
          {selectedTemplate ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                  {selectedTemplate.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTemplate.description}
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedTemplate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Variable inputs */}
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
                        onChange={(e) => setVariableValues(prev => ({
                          ...prev,
                          [variable.name]: e.target.value
                        }))}
                        placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview:</Label>
                <div className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap font-mono">
                  {fillTemplate(selectedTemplate, variableValues)}
                </div>
              </div>

              <Button 
                onClick={handleUseTemplate} 
                className="w-full gap-2"
                size="lg"
              >
                <Play className="h-4 w-4" />
                Use Template
              </Button>
            </div>
          ) : (
            <>
              {/* Category tabs */}
              <div className="border-b px-4 overflow-x-auto scrollbar-none">
                <div className="flex gap-1 py-2">
                  {TEMPLATE_CATEGORIES.map((category) => {
                    const Icon = getCategoryIcon(category.icon);
                    return (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "secondary" : "ghost"}
                        size="sm"
                        className="shrink-0 gap-1.5 text-xs"
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Template list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No templates found</p>
                    </div>
                  ) : (
                    filteredTemplates.map((template) => {
                      const Icon = getCategoryIcon(template.icon);
                      return (
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
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm truncate">{template.name}</h4>
                                {template.is_favorite && (
                                  <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                                )}
                              </div>
                              {template.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {template.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] h-5">
                                  {template.category}
                                </Badge>
                                {template.variables.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  Used {template.usage_count}x
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(template.id);
                                }}
                              >
                                <Heart className={cn(
                                  "h-3.5 w-3.5",
                                  template.is_favorite ? "text-red-500 fill-red-500" : ""
                                )} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTemplate(template.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
