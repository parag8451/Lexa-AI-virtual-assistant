import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, VolumeX, PhoneOff, Sparkles, MessageSquare,
  Settings2, Pause, Play, ChevronDown, Check, Loader2, RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>("default");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0.2);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const isComponentMounted = useRef<boolean>(true);
  const { toast } = useToast();

  const activeGeminiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem("lexa_gemini_key") ||
    "";
  const activeElevenLabsKey =
    import.meta.env.VITE_ELEVENLABS_API_KEY ||
    localStorage.getItem("lexa_elevenlabs_key") ||
    "";

  // Load browser voices
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

  // Audio level analyzer from microphone
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!isComponentMounted.current) return;
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        setAudioLevel(0.15 + normalized * 0.85);
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
        description: "Your browser does not support Web Speech API.",
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
          // If stopped without text, idle
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
      // Call LLM
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
                  text: "You are Lexa, an intelligent, charming, and highly articulate real-time voice assistant. Keep answers natural, spoken, and conversational (1-3 sentences max unless deeply asked). Do not use markdown headers, asterisks, or code blocks in voice answers unless reading code.",
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
        // Fallback response
        aiReply = "I'm listening and right here with you. What would you like to explore next?";
      }

      const aiMsg: VoiceMessage = {
        id: `ai_${Date.now()}`,
        role: "ai",
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      onSendToChatHistory?.(text, aiReply);

      // Speak reply aloud
      speakResponse(aiReply);
    } catch (err) {
      console.error("Voice assistant generation error:", err);
      setStatus("idle");
      if (isHandsFree) {
        setTimeout(startListening, 1000);
      }
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
      if (isHandsFree && isOpen) {
        setTimeout(startListening, 400);
      }
    };

    utterance.onerror = () => {
      setStatus("idle");
      if (isHandsFree && isOpen) {
        setTimeout(startListening, 400);
      }
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop / Interrupt
  const handleInterrupt = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    setStatus("idle");
  };

  // Open / Close lifecycle
  useEffect(() => {
    isComponentMounted.current = true;
    if (isOpen) {
      startAudioAnalyzer();
      // Start initial listening automatically
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      handleInterrupt();
      stopAudioAnalyzer();
    }

    return () => {
      isComponentMounted.current = false;
      handleInterrupt();
      stopAudioAnalyzer();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Visualizer Orb dynamic styles based on status
  const getOrbGlow = () => {
    switch (status) {
      case "listening":
        return "from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_80px_rgba(56,189,248,0.5)]";
      case "thinking":
        return "from-purple-500 via-pink-500 to-amber-500 shadow-[0_0_90px_rgba(168,85,247,0.6)] animate-spin";
      case "speaking":
        return "from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_90px_rgba(52,211,153,0.6)]";
      default:
        return "from-indigo-600 via-purple-600 to-blue-600 shadow-[0_0_50px_rgba(99,102,241,0.3)]";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "listening":
        return "Listening to your voice...";
      case "thinking":
        return "Lexa is reasoning...";
      case "speaking":
        return "Lexa is speaking...";
      default:
        return isHandsFree ? "Tap the orb to start speaking" : "Hold to talk";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080c]/95 backdrop-blur-2xl p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-4xl h-[90vh] bg-gradient-to-b from-[#11131f]/90 to-[#0b0c14]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Lexa Live Voice
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase tracking-wider">
                    Continuous
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">Natural Real-Time Dialogue</p>
              </div>
            </div>

            {/* Top controls */}
            <div className="flex items-center gap-2">
              {/* Voice selector */}
              {availableVoices.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="bg-[#181a28] text-zinc-200 text-xs px-3 py-1.5 rounded-xl border border-white/10 focus:outline-none cursor-pointer pr-6"
                  >
                    {availableVoices.slice(0, 10).map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name.slice(0, 18)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-2 rounded-xl border transition-colors ${
                  showTranscript
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                    : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                }`}
                title="Toggle transcript feed"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                title="End Voice Chat"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Experience: Visualizer Orb & Transcript */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Background Ambient Glow */}
            <div
              className="absolute w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25"
              style={{
                background:
                  status === "listening"
                    ? "#38bdf8"
                    : status === "speaking"
                    ? "#34d399"
                    : status === "thinking"
                    ? "#c084fc"
                    : "#6366f1",
              }}
            />

            {/* Glowing Orb */}
            <div className="relative flex items-center justify-center my-6">
              {/* Outer Pulsing Wave Rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{
                    scale: status === "speaking" || status === "listening" ? [1, 1.25 + ring * 0.18, 1] : [1, 1.08, 1],
                    opacity: status === "speaking" || status === "listening" ? [0.6, 0.1, 0.6] : [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 2 + ring * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: ring * 0.3,
                  }}
                  className={`absolute w-48 h-48 rounded-full border border-white/10 pointer-events-none`}
                  style={{
                    transform: `scale(${1 + audioLevel * (ring * 0.15)})`,
                  }}
                />
              ))}

              {/* Main Interactive Center Orb */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={status === "speaking" ? handleInterrupt : status === "listening" ? stopListening : startListening}
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr ${getOrbGlow()} p-1 flex items-center justify-center transition-all duration-500 cursor-pointer relative z-10`}
                style={{
                  transform: `scale(${status === "speaking" || status === "listening" ? 1 + audioLevel * 0.15 : 1})`,
                }}
              >
                <div className="w-full h-full rounded-full bg-[#0a0b12]/80 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center border border-white/20">
                  {status === "thinking" ? (
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                  ) : status === "speaking" ? (
                    <Volume2 className="w-10 h-10 text-emerald-400 animate-pulse" />
                  ) : status === "listening" ? (
                    <Mic className="w-10 h-10 text-cyan-400 animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10 text-zinc-400 hover:text-white" />
                  )}
                  <span className="text-[11px] text-zinc-300 font-medium mt-2">
                    {status === "speaking" ? "Tap to Stop" : status === "listening" ? "Listening..." : "Tap to Speak"}
                  </span>
                </div>
              </motion.button>
            </div>

            {/* Status Subtitle */}
            <div className="text-center mt-2">
              <p className="text-sm font-semibold text-white tracking-wide">{getStatusLabel()}</p>
              {interimText && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-cyan-300 italic max-w-md mx-auto mt-1"
                >
                  "{interimText}"
                </motion.p>
              )}
            </div>

            {/* Live Transcript Drawer/Panel */}
            <AnimatePresence>
              {showTranscript && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full max-w-xl max-h-36 overflow-y-auto mt-4 p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2 backdrop-blur-md text-left text-xs"
                >
                  {messages.slice(-3).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "text-cyan-300" : "text-zinc-300"}`}
                    >
                      <span className="font-bold text-[10px] uppercase opacity-75 shrink-0">
                        {msg.role === "user" ? "You:" : "Lexa:"}
                      </span>
                      <p className="flex-1 leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Control Bar */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#121422]/90 backdrop-blur-md flex items-center justify-between shrink-0">
            {/* Hands-Free Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsHandsFree(!isHandsFree)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isHandsFree
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isHandsFree ? "bg-cyan-400 animate-pulse" : "bg-zinc-500"}`} />
                <span>Hands-free Mode</span>
              </button>
            </div>

            {/* Central Actions */}
            <div className="flex items-center gap-2">
              {status === "speaking" && (
                <button
                  type="button"
                  onClick={handleInterrupt}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Interrupt
                </button>
              )}
              {status === "idle" && (
                <button
                  type="button"
                  onClick={startListening}
                  className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-white/20 transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Start Talking
                </button>
              )}
            </div>

            {/* End Call Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-semibold shadow-lg shadow-rose-500/25 transition-all"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
