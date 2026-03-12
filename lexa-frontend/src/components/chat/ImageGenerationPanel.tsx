import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Sparkles,
  Download,
  Trash2,
  Loader2,
  Maximize2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";
import { useImageGeneration, GeneratedImage, ImageSize, ImageQuality, ImageStyle } from "@/hooks/useImageGeneration";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SIZE_OPTIONS: { value: ImageSize; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "1024x1024", label: "Square", icon: Square },
  { value: "1792x1024", label: "Wide", icon: RectangleHorizontal },
  { value: "1024x1792", label: "Tall", icon: RectangleVertical },
];

export function ImageGenerationPanel({ conversationId }: { conversationId?: string }) {
  const {
    images,
    isGenerating,
    generateImage,
    deleteImage,
    getConversationImages,
  } = useImageGeneration();

  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [quality, setQuality] = useState<ImageQuality>("standard");
  const [style, setStyle] = useState<ImageStyle>("vivid");
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const displayImages = conversationId 
    ? getConversationImages(conversationId)
    : images;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    await generateImage(prompt, {
      size,
      quality,
      style,
      conversationId,
    });
    
    setPrompt("");
  };

  const handleDownload = (image: GeneratedImage) => {
    if (!image.image_url) return;
    const a = document.createElement("a");
    a.href = image.image_url;
    a.download = `generated-${image.id}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Images</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            AI Image Generation
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Generation Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="resize-none"
            />
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Size */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {SIZE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSize(opt.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors",
                        size === opt.value
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Quality */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(["standard", "hd"] as ImageQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={cn(
                      "px-2 py-1 rounded text-sm transition-colors capitalize",
                      quality === q
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Style */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(["vivid", "natural"] as ImageStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "px-2 py-1 rounded text-sm transition-colors capitalize",
                      style === s
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="ml-auto gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Image Grid */}
          <ScrollArea className="flex-1">
            {displayImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No images generated yet</p>
                <p className="text-sm mt-1">Describe what you want to see above</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
                {displayImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
                  >
                    {image.status === "processing" ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : image.status === "completed" && image.image_url ? (
                      <>
                        <img
                          src={image.image_url}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => setSelectedImage(image)}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => handleDownload(image)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-destructive">
                        Failed
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="max-w-4xl max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage.image_url || ""}
                  alt={selectedImage.prompt}
                  className="max-w-full max-h-[80vh] rounded-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                  <p className="text-white text-sm">{selectedImage.prompt}</p>
                  {selectedImage.revised_prompt && (
                    <p className="text-white/70 text-xs mt-1">
                      Revised: {selectedImage.revised_prompt}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
