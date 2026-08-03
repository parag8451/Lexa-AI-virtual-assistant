import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Video,
  Wand2,
  Upload,
  Play,
} from "lucide-react";
import { useImageGeneration, GeneratedImage, ImageSize, ImageQuality, ImageStyle } from "@/hooks/useImageGeneration";
import { useVideoGeneration, GeneratedVideo, VideoAspectRatio, VideoDuration } from "@/hooks/useVideoGeneration";
import { cn } from "@/lib/utils";

const SIZE_OPTIONS: { value: ImageSize; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "1024x1024", label: "Square", icon: Square },
  { value: "1792x1024", label: "Wide", icon: RectangleHorizontal },
  { value: "1024x1792", label: "Tall", icon: RectangleVertical },
];

const ASPECT_RATIO_OPTIONS: { value: VideoAspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
];

export function MediaGenerationPanel({ conversationId }: { conversationId?: string }) {
  const {
    images,
    isGenerating: isGeneratingImage,
    isEditing,
    generateImage,
    editImage,
    deleteImage,
  } = useImageGeneration();

  const {
    videos,
    isGenerating: isGeneratingVideo,
    generateVideo,
    deleteVideo,
  } = useVideoGeneration();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  
  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [quality, setQuality] = useState<ImageQuality>("standard");
  const [style, setStyle] = useState<ImageStyle>("vivid");
  
  // Image editing state
  const [editPrompt, setEditPrompt] = useState("");
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<GeneratedImage | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [startingFrameUrl, setStartingFrameUrl] = useState<string | null>(null);
  
  // Preview state
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    await generateImage(imagePrompt, { size, quality, style, conversationId });
    setImagePrompt("");
  };

  const handleEditImage = async () => {
    if (!editPrompt.trim()) return;
    const sourceUrl = selectedImageForEdit?.image_url || uploadedImageUrl;
    if (!sourceUrl) return;
    
    await editImage(editPrompt, sourceUrl, { conversationId });
    setEditPrompt("");
    setSelectedImageForEdit(null);
    setUploadedImageUrl(null);
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    await generateVideo(videoPrompt, { 
      aspectRatio, 
      duration, 
      startingFrameUrl: startingFrameUrl || undefined,
      conversationId 
    });
    setVideoPrompt("");
    setStartingFrameUrl(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, target: "edit" | "video") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === "edit") {
        setUploadedImageUrl(base64);
        setSelectedImageForEdit(null);
      } else {
        setStartingFrameUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Media</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Media Studio
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Square className="h-4 w-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          {/* Create Image Tab */}
          <TabsContent value="create" className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Describe the image you want to create..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />
              
              <div className="flex flex-wrap items-center gap-3">
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
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="ml-auto gap-2"
                >
                  {isGeneratingImage ? (
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

            <ScrollArea className="flex-1">
              <RecentMediaGrid
                images={images.slice(0, 6)}
                onSelectImage={setSelectedImage}
                onDownload={(img) => handleDownload(img.image_url!, `image-${img.id}.png`)}
                onDelete={deleteImage}
              />
            </ScrollArea>
          </TabsContent>

          {/* Edit Image Tab */}
          <TabsContent value="edit" className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                {/* Source image selection */}
                <div className="flex-1 space-y-2">
                  <label className="text-sm text-muted-foreground">Source Image</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "edit")}
                    />
                    {images.length > 0 && (
                      <select
                        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                        value={selectedImageForEdit?.id || ""}
                        onChange={(e) => {
                          const img = images.find(i => i.id === e.target.value);
                          setSelectedImageForEdit(img || null);
                          setUploadedImageUrl(null);
                        }}
                      >
                        <option value="">Select from gallery...</option>
                        {images.filter(i => i.image_url).map(img => (
                          <option key={img.id} value={img.id}>
                            {img.prompt.substring(0, 40)}...
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  {(selectedImageForEdit?.image_url || uploadedImageUrl) && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={selectedImageForEdit?.image_url || uploadedImageUrl!}
                        alt="Source"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Textarea
                placeholder="Describe how you want to edit this image... (e.g., 'make it sunset', 'add snow')"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />

              <Button
                onClick={handleEditImage}
                disabled={isEditing || !editPrompt.trim() || (!selectedImageForEdit && !uploadedImageUrl)}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Edit Image
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Describe the video you want to create... (e.g., 'waves crashing on a beach at sunset')"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />

              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAspectRatio(opt.value)}
                        className={cn(
                          "px-2 py-1 rounded text-sm transition-colors",
                          aspectRatio === opt.value
                            ? "bg-background shadow text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Duration</label>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {([5, 10] as VideoDuration[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={cn(
                          "px-2 py-1 rounded text-sm transition-colors",
                          duration === d
                            ? "bg-background shadow text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || !videoPrompt.trim()}
                  className="ml-auto gap-2"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>

              {/* Starting frame option */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Optional: Add starting frame</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => handleFileUpload(e as any, "video");
                    input.click();
                  }}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
                {startingFrameUrl && (
                  <div className="w-16 h-16 rounded overflow-hidden border">
                    <img src={startingFrameUrl} alt="Start frame" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <VideoGrid
                videos={videos}
                onSelect={setSelectedVideo}
                onDownload={(v) => handleDownload(v.video_url!, `video-${v.id}.mp4`)}
                onDelete={deleteVideo}
              />
            </ScrollArea>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Images ({images.length})</h3>
                  <RecentMediaGrid
                    images={images}
                    onSelectImage={setSelectedImage}
                    onDownload={(img) => handleDownload(img.image_url!, `image-${img.id}.png`)}
                    onDelete={deleteImage}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-3">Videos ({videos.length})</h3>
                  <VideoGrid
                    videos={videos}
                    onSelect={setSelectedVideo}
                    onDownload={(v) => handleDownload(v.video_url!, `video-${v.id}.mp4`)}
                    onDelete={deleteVideo}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function RecentMediaGrid({
  images,
  onSelectImage,
  onDownload,
  onDelete,
}: {
  images: GeneratedImage[];
  onSelectImage: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
  onDelete: (id: string) => void;
}) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No images generated yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
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
                <Button size="icon" variant="secondary" onClick={() => onSelectImage(image)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={() => onDownload(image)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onDelete(image.id)}>
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
  );
}

function VideoGrid({
  videos,
  onSelect,
  onDownload,
  onDelete,
}: {
  videos: GeneratedVideo[];
  onSelect: (v: GeneratedVideo) => void;
  onDownload: (v: GeneratedVideo) => void;
  onDelete: (id: string) => void;
}) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No videos generated yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {videos.map((video) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative aspect-video rounded-xl overflow-hidden border bg-muted"
        >
          {video.status === "processing" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : video.status === "completed" && video.video_url ? (
            <>
              <img
                src={video.video_url}
                alt={video.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={() => onDownload(video)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onDelete(video.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Badge className="absolute top-2 right-2 text-xs">
                {video.duration}s
              </Badge>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-destructive">
              Failed
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
