import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, X, RefreshCw, Sparkles, FileText, Check, AlertCircle,
  ScanLine, HelpCircle, BookOpen, Languages, Calculator, Eye, Sliders
} from "lucide-react";
import { FileAttachment, createAttachmentFromCanvas } from "@/lib/fileParser";
import { useToast } from "@/hooks/use-toast";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureAndSend: (attachment: FileAttachment, promptPreset?: string) => void;
}

const SCAN_PRESETS = [
  {
    id: "ocr",
    label: "Extract Text (OCR)",
    icon: FileText,
    prompt: "Please perform OCR: extract, transcribe, and format all visible text in this scanned document with high precision.",
    gradient: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-300",
  },
  {
    id: "summarize",
    label: "Scan & Summarize",
    icon: BookOpen,
    prompt: "Please scan this document/page and provide a clear, concise bulleted summary of its key points, conclusions, and action items.",
    gradient: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
  },
  {
    id: "solve",
    label: "Solve Question / Code",
    icon: Calculator,
    prompt: "Please read the problem, question, math formula, or code snippet shown in this image and provide a comprehensive step-by-step solution.",
    gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
  },
  {
    id: "explain",
    label: "Explain Diagram / Image",
    icon: Eye,
    prompt: "Please analyze and explain what is depicted in this image/diagram, including any charts, workflows, or visual relationships.",
    gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
  },
  {
    id: "translate",
    label: "Translate Text",
    icon: Languages,
    prompt: "Please detect the language in this image, extract the text, and translate it clearly into English with key explanations.",
    gradient: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300",
  },
];

export function CameraScannerModal({
  isOpen,
  onClose,
  onCaptureAndSend,
}: CameraScannerModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [capturedAttachment, setCapturedAttachment] = useState<FileAttachment | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("ocr");
  const [customPrompt, setCustomPrompt] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [scanMode, setScanMode] = useState<"document" | "photo">("document");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Start / Stop Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "Unable to access camera. Please check your camera connection."
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen && !capturedAttachment) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedAttachment, startCamera, stopCamera]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Trigger flash animation
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const attachment = createAttachmentFromCanvas(canvas, `scan_${Date.now()}.jpg`);
    setCapturedAttachment(attachment);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedAttachment(null);
    setCustomPrompt("");
    startCamera();
  };

  const handleSend = (presetId?: string) => {
    if (!capturedAttachment) return;
    const preset = SCAN_PRESETS.find((p) => p.id === (presetId || selectedPreset));
    const finalPrompt = customPrompt.trim() || preset?.prompt || "Please analyze this scanned image.";
    onCaptureAndSend(capturedAttachment, finalPrompt);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedAttachment(null);
    setCustomPrompt("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
        {/* Flash Effect */}
        <AnimatePresence>
          {isFlashActive && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white z-[60] pointer-events-none"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0f111a] border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#141724]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ScanLine className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Lexa Vision Scanner
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 uppercase tracking-wider">
                    Live OCR
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {capturedAttachment ? "Review snapshot & choose AI scan preset" : "Align document, notes, textbook, or diagram within the frame"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!capturedAttachment && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Switch camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Viewport Area */}
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[380px]">
            <canvas ref={canvasRef} className="hidden" />

            {/* Error View */}
            {cameraError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h4 className="text-white font-semibold mb-2">Camera Unavailable</h4>
                <p className="text-xs text-zinc-400 mb-6">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-medium transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : capturedAttachment ? (
              /* Captured Image Preview */
              <div className="relative w-full h-full flex items-center justify-center p-4 bg-zinc-950">
                <img
                  src={capturedAttachment.dataUrl}
                  alt="Captured scan"
                  className="max-h-[340px] sm:max-h-[420px] w-auto max-w-full rounded-2xl object-contain border border-white/15 shadow-2xl"
                />
                <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Captured ({formatSize(capturedAttachment.size)})
                </div>
              </div>
            ) : (
              /* Live Camera Stream with Frame Overlay */
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Scanner Frame Guide */}
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-cyan-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_50px_rgba(56,189,248,0.15)]">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                  </div>

                  {/* Animated Scanning Laser Line */}
                  <motion.div
                    animate={{ y: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]"
                  />

                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Top Overlay Badge */}
                <div className="absolute top-4 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Position text or page inside the frame
                </div>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-4 sm:p-5 bg-[#121420] border-t border-white/10 flex flex-col gap-3 shrink-0">
            {capturedAttachment ? (
              /* Action Presets and Send */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Choose AI Vision Preset:</span>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retake Photo
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SCAN_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                          isSelected
                            ? `bg-gradient-to-r ${preset.gradient} shadow-lg shadow-black/40 scale-[1.02]`
                            : "bg-white/[0.04] border-white/10 hover:border-white/20 text-zinc-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Prompt Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Or ask a custom question about this scan..."
                    className="w-full bg-[#181a26] text-xs text-white pl-3.5 pr-24 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400/50 focus:outline-none placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    Ask Lexa
                  </button>
                </div>
              </div>
            ) : (
              /* Live Capture Shutter Button */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScanMode("document")}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      scanMode === "document"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                    }`}
                  >
                    Document Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode("photo")}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      scanMode === "photo"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                    }`}
                  >
                    Photo Mode
                  </button>
                </div>

                {/* Shutter Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={handleCapture}
                  className="w-14 h-14 rounded-full p-1 border-2 border-white/40 hover:border-cyan-400 transition-colors flex items-center justify-center shadow-2xl"
                  title="Take Snapshot"
                >
                  <div className="w-full h-full rounded-full bg-white hover:bg-cyan-400 transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 text-black" />
                  </div>
                </motion.button>

                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 block">High-Res OCR</span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">1080p Ready</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 KB";
  return `${(bytes / 1024).toFixed(0)} KB`;
}
