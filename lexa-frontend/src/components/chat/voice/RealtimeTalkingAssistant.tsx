import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, VolumeX, PhoneOff, Sparkles, MessageSquare,
  Settings2, Pause, Play, ChevronDown, Check, Loader2, RotateCcw,
  Radio, Shield, Wifi, Captions, Maximize2, Minimize2, User, PhoneCall
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Strands from "@/components/effects/Strands";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VoiceMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface RealtimeTalkingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChatHistory?: (userMsg: string, aiMsg: string) => void;
}

export function RealtimeTalkingAssistant({
  isOpen,
  onClose,
  onSendToChatHistory,
}: RealtimeTalkingAssistantProps) {
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("default");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0.15);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const isComponentMounted = useRef<boolean>(true);
  const durationTimerRef = useRef<any>(null);
  const { toast } = useToast();

  const activeGeminiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem("lexa_gemini_key") ||
    "";

  // Load available speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if ("speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && selectedVoice === "default") {
          const naturalVoice =
            voices.find((v) => v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Aria") || v.name.includes("Samantha")) ||
            voices.find((v) => v.lang.startsWith("en")) ||
            voices[0];
          if (naturalVoice) setSelectedVoice(naturalVoice.name);
        }
      }
    };

    updateVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  // Call duration counter
  useEffect(() => {
    if (isOpen) {
      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Real-time Audio Analyzer for sound-reactive waves
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!isComponentMounted.current) return;
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 110);
        setAudioLevel(0.12 + normalized * 0.88);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn("Microphone analyzer error:", e);
    }
  };

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Web Speech Recognition
  const startListening = useCallback(() => {
    if (isMuted) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser does not support the Web Speech API.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setStatus("listening");
        setInterimText("");
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setInterimText(interim);
        if (final) {
          setTranscript(final);
          setInterimText("");
          handleUserUtterance(final);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Recognition error:", err);
        if (status === "listening") setStatus("idle");
      };

      rec.onend = () => {
        if (status === "listening") {
          setStatus("idle");
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error("Speech recognition start failed:", e);
      setStatus("idle");
    }
  }, [isMuted, status, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (status === "listening") setStatus("idle");
  }, [status]);

  // Handle user's spoken sentence
  const handleUserUtterance = async (userInput: string) => {
    const text = userInput.trim();
    if (!text) return;

    stopListening();
    setStatus("thinking");

    const userMsg: VoiceMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const historyContents = messages.slice(-6).map((m) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${activeGeminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...historyContents,
              { role: "user", parts: [{ text }] },
            ],
            systemInstruction: {
              parts: [
                {
                  text: "You are Lexa, a warm, intelligent, and highly articulate real-time voice assistant on a live phone call. Keep answers natural, spoken, concise and conversational (1-3 sentences max). Speak directly and concisely without markdown formatting.",
                },
              ],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 250,
            },
          }),
        }
      );

      let aiReply = "I understand. How else can I help you today?";
      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) aiReply = candidate;
      } else {
        aiReply = "I'm listening and right here with you. What would you like to discuss next?";
      }

      const aiMsg: VoiceMessage = {
        id: `ai_${Date.now()}`,
        role: "ai",
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      onSendToChatHistory?.(text, aiReply);

      if (isSpeakerOn) {
        speakResponse(aiReply);
      } else {
        setStatus("idle");
        setTimeout(startListening, 500);
      }
    } catch (err) {
      console.error("Voice assistant generation error:", err);
      setStatus("idle");
      setTimeout(startListening, 1000);
    }
  };

  // Speak AI response with TTS
  const speakResponse = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setStatus("idle");
      return;
    }

    window.speechSynthesis.cancel();
    setStatus("speaking");

    const cleanText = text.replace(/[*_#`\[\]]/g, "").replace(/\n/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (selectedVoice) {
      const voice = availableVoices.find((v) => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    utterance.rate = 1.05;
    utterance.pitch = 1.02;

    utterance.onend = () => {
      setStatus("idle");
      if (isOpen && !isMuted) {
        setTimeout(startListening, 350);
      }
    };

    utterance.onerror = () => {
      setStatus("idle");
      if (isOpen && !isMuted) {
        setTimeout(startListening, 350);
      }
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop / Interrupt AI
  const handleInterrupt = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    setStatus("idle");
    setTimeout(startListening, 200);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
      toast({ title: "Microphone unmuted" });
    } else {
      setIsMuted(true);
      stopListening();
      toast({ title: "Microphone muted" });
    }
  };

  // Open / Close lifecycle
  useEffect(() => {
    isComponentMounted.current = true;
    if (isOpen) {
      startAudioAnalyzer();
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      stopListening();
      stopAudioAnalyzer();
    }

    return () => {
      isComponentMounted.current = false;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      stopListening();
      stopAudioAnalyzer();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Sound-Reactive Wave: Keep the slow, hypnotic, glowing thinking-style waves permanently
  const getStrandsConfig = () => {
    // Beautiful glowing thinking palette: Violet -> Cyan -> Indigo
    const thinkingColors = ["#818CF8", "#C084FC", "#38BDF8"];

    return {
      colors: thinkingColors,
      count: 1,
      speed: 0.65, // Slow, hypnotic, soothing wave speed
      amplitude: 0.55 + (status === "speaking" ? 0.08 : status === "listening" ? audioLevel * 0.15 : 0.0),
      waviness: 2.3,
      thickness: 0.72,
      glow: 2.8,
      taper: 5.5,
      spread: 3.0,
      intensity: 1.0,
      saturation: 2.0,
      opacity: 0.85,
      scale: 2.3,
    };
  };

  const currentStrands = getStrandsConfig();
  const latestMessage = messages[messages.length - 1];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-2xl select-none overflow-hidden">
        {/* Fullscreen Phone Call Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full sm:max-w-md sm:h-[780px] sm:max-h-[92vh] sm:rounded-[40px] bg-[#07080d] border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* ── WebGL Audio-Reactive Strands Background ── */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
            <Strands
              colors={currentStrands.colors}
              count={currentStrands.count}
              speed={currentStrands.speed}
              amplitude={currentStrands.amplitude}
              waviness={currentStrands.waviness}
              thickness={currentStrands.thickness}
              glow={currentStrands.glow}
              taper={currentStrands.taper}
              spread={currentStrands.spread}
              intensity={currentStrands.intensity}
              saturation={currentStrands.saturation}
              opacity={currentStrands.opacity}
              scale={currentStrands.scale}
            />
          </div>

          {/* Vignette & Soft Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(7,8,13,0.75)_100%)] pointer-events-none z-0" />

          {/* ── Top Header / Call Info Bar ── */}
          <div className="relative z-10 px-6 pt-7 sm:pt-6 flex items-center justify-between">
            {/* Call Encryption & Live Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300 font-medium">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>HD Voice</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] text-zinc-400">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span>12ms</span>
              </div>
            </div>

            {/* Voice Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                  title="Voice Settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#131520]/95 backdrop-blur-xl border border-white/10 text-white p-2 rounded-2xl shadow-2xl z-50">
                <DropdownMenuLabel className="text-xs text-zinc-400 uppercase tracking-wider px-2 py-1">
                  AI Spoken Voice
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {availableVoices.slice(0, 8).map((voice) => (
                  <DropdownMenuItem
                    key={voice.name}
                    onClick={() => setSelectedVoice(voice.name)}
                    className={`flex items-center justify-between text-xs p-2 rounded-xl cursor-pointer ${
                      selectedVoice === voice.name ? "bg-cyan-500/20 text-cyan-300" : "hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{voice.name}</span>
                    {selectedVoice === voice.name && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Center Caller Identity & Status ── */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-4 my-auto">
            {/* Animated Lexa Emblem & Breathing Halo */}
            <div className="relative mb-6">
              {/* Outer Pulse Rings */}
              <motion.div
                animate={{
                  scale: status === "speaking" ? [1, 1.25, 1] : status === "listening" ? [1, 1.15 + audioLevel * 0.35, 1] : [1, 1.05, 1],
                  opacity: status === "speaking" ? [0.4, 0.8, 0.4] : [0.25, 0.55, 0.25],
                }}
                transition={{ duration: status === "speaking" ? 1.4 : 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/30 to-purple-500/30 blur-xl pointer-events-none"
              />

              {/* Center Luxury Round Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#181c2e] to-[#0d0f1a] border-2 border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-xl">
                <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="phoneStar" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#phoneStar)" />
                  <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill="url(#phoneStar)" opacity="0.6" />
                </svg>

                {/* Subtle active status indicator dot */}
                <div className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-[#07080d] p-0.5 flex items-center justify-center">
                  <span
                    className={`w-full h-full rounded-full ${
                      status === "speaking"
                        ? "bg-emerald-400 animate-pulse"
                        : status === "listening"
                        ? "bg-cyan-400 animate-ping"
                        : status === "thinking"
                        ? "bg-purple-400 animate-spin"
                        : isMuted
                        ? "bg-rose-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Caller Name & Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 font-sans">
              Lexa AI
            </h2>
            <p className="text-xs text-zinc-400 font-medium mb-3">
              Realtime Multimodal Neural Call
            </p>

            {/* Live Call Duration Timer */}
            <div className="text-sm font-semibold text-zinc-300 font-mono tracking-wider bg-white/[0.07] px-3.5 py-1 rounded-full border border-white/10 mb-4 shadow-sm">
              {formatDuration(callDuration)}
            </div>

            {/* Dynamic Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-xs text-zinc-200 shadow-sm">
              {status === "listening" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Listening to you...</span>
                </>
              )}
              {status === "thinking" && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span>Lexa is thinking...</span>
                </>
              )}
              {status === "speaking" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Lexa is speaking...</span>
                </>
              )}
              {status === "idle" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  <span>{isMuted ? "Muted" : "Ready / Waiting..."}</span>
                </>
              )}
            </div>
          </div>

          {/* ── Live Captions & Teleprompter Card ── */}
          <div className="relative z-10 px-6 mb-2">
            <AnimatePresence>
              {showCaptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full min-h-[64px] max-h-[100px] overflow-y-auto rounded-2xl p-3 bg-black/60 backdrop-blur-xl border border-white/15 text-center flex flex-col items-center justify-center text-xs sm:text-sm leading-relaxed shadow-lg"
                >
                  {interimText ? (
                    <p className="text-cyan-300 italic font-medium">"{interimText}"</p>
                  ) : status === "thinking" ? (
                    <p className="text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Formulating response...
                    </p>
                  ) : latestMessage ? (
                    <p className="text-zinc-200">
                      <span className="text-zinc-400 font-semibold mr-1">
                        {latestMessage.role === "user" ? "You:" : "Lexa:"}
                      </span>
                      {latestMessage.content}
                    </p>
                  ) : (
                    <p className="text-zinc-400 text-xs">
                      Start speaking naturally. Lexa will respond in real time.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Realistic Phone Call Bottom Control Tray ── */}
          <div className="relative z-10 px-6 pb-8 pt-3 bg-gradient-to-t from-[#05060a] via-[#05060a]/90 to-transparent">
            <div className="grid grid-cols-4 gap-3 items-center justify-items-center max-w-sm mx-auto mb-4">
              {/* 1. Mic Mute / Unmute */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md border ${
                    isMuted
                      ? "bg-rose-500/25 border-rose-500/40 text-rose-400"
                      : "bg-white/[0.08] hover:bg-white/[0.16] border-white/12 text-white"
                  }`}
                  aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {isMuted ? "Unmute" : "Mute"}
                </span>
              </div>

              {/* 2. Speaker Output Toggle */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSpeakerOn((prev) => !prev);
                    if (isSpeakerOn && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md border ${
                    isSpeakerOn
                      ? "bg-white/[0.08] hover:bg-white/[0.16] border-white/12 text-white"
                      : "bg-white/5 border-white/5 text-zinc-500"
                  }`}
                  aria-label="Toggle Speaker"
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <span className="text-[10px] text-zinc-400 font-medium">Speaker</span>
              </div>

              {/* 3. Captions / Subtitles Toggle */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCaptions((prev) => !prev)}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md border ${
                    showCaptions
                      ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                      : "bg-white/[0.08] hover:bg-white/[0.16] border-white/12 text-zinc-400"
                  }`}
                  aria-label="Toggle Captions"
                >
                  <Captions className="w-5 h-5" />
                </button>
                <span className="text-[10px] text-zinc-400 font-medium">Captions</span>
              </div>

              {/* 4. Interrupt / Push-to-Talk Turn */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleInterrupt}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/12 text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
                  title="Interrupt & Speak Now"
                  aria-label="Interrupt AI"
                >
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                </button>
                <span className="text-[10px] text-zinc-400 font-medium">Interrupt</span>
              </div>
            </div>

            {/* 🔴 Big Red End Call Button */}
            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-[260px] py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(225,29,72,0.4)] border border-rose-400/40 transition-all cursor-pointer"
                aria-label="End Voice Call"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
