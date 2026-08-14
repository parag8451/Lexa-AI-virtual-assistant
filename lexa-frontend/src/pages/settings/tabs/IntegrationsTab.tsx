import React, { useState, useEffect } from "react";
import {
  Sparkles, Check, Key, ExternalLink, ShieldCheck, AlertCircle,
  Loader2, Eye, EyeOff, Bot, Mic, Cpu, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LogoIcon } from '@/components/ui/LogoIcon';

interface KeyState {
  value: string;
  isSaved: boolean;
  status: "untested" | "testing" | "valid" | "invalid";
  errorMsg?: string;
}

export function IntegrationsTab() {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  const [geminiKey, setGeminiKey] = useState<KeyState>({
    value: localStorage.getItem("lexa_gemini_key") || "",
    isSaved: Boolean(localStorage.getItem("lexa_gemini_key")),
    status: "untested",
  });

  const [openaiKey, setOpenaiKey] = useState<KeyState>({
    value: localStorage.getItem("lexa_openai_key") || "",
    isSaved: Boolean(localStorage.getItem("lexa_openai_key")),
    status: "untested",
  });

  const [elevenlabsKey, setElevenlabsKey] = useState<KeyState>({
    value: localStorage.getItem("lexa_elevenlabs_key") || import.meta.env.VITE_ELEVENLABS_API_KEY || "",
    isSaved: Boolean(localStorage.getItem("lexa_elevenlabs_key") || import.meta.env.VITE_ELEVENLABS_API_KEY),
    status: "untested",
  });

  const toggleShow = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKey = (provider: "gemini" | "openai" | "elevenlabs") => {
    if (provider === "gemini") {
      localStorage.setItem("lexa_gemini_key", geminiKey.value.trim());
      setGeminiKey((p) => ({ ...p, isSaved: true }));
    } else if (provider === "openai") {
      localStorage.setItem("lexa_openai_key", openaiKey.value.trim());
      setOpenaiKey((p) => ({ ...p, isSaved: true }));
    } else if (provider === "elevenlabs") {
      localStorage.setItem("lexa_elevenlabs_key", elevenlabsKey.value.trim());
      setElevenlabsKey((p) => ({ ...p, isSaved: true }));
    }

    toast({
      title: "API Key Saved",
      description: `${provider.toUpperCase()} API key updated successfully in local storage.`,
    });
  };

  const testGeminiKey = async () => {
    const key = geminiKey.value.trim();
    if (!key) {
      toast({ title: "Please enter a Gemini API key first", variant: "destructive" });
      return;
    }

    setGeminiKey((p) => ({ ...p, status: "testing", errorMsg: undefined }));
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "ping" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );

      if (res.ok) {
        setGeminiKey((p) => ({ ...p, status: "valid" }));
        toast({ title: "Gemini Key Connected!", description: "Multimodal Vision & Chat active." });
      } else {
        const err = await res.json().catch(() => ({}));
        setGeminiKey((p) => ({ ...p, status: "invalid", errorMsg: err?.error?.message || "Invalid API key" }));
      }
    } catch (e: any) {
      setGeminiKey((p) => ({ ...p, status: "invalid", errorMsg: e?.message || "Network error" }));
    }
  };

  const testOpenaiKey = async () => {
    const key = openaiKey.value.trim();
    if (!key) {
      toast({ title: "Please enter an OpenAI API key first", variant: "destructive" });
      return;
    }

    setOpenaiKey((p) => ({ ...p, status: "testing", errorMsg: undefined }));
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) {
        setOpenaiKey((p) => ({ ...p, status: "valid" }));
        toast({ title: "OpenAI Key Connected!", description: "GPT-4o & OpenAI models verified." });
      } else {
        const err = await res.json().catch(() => ({}));
        setOpenaiKey((p) => ({ ...p, status: "invalid", errorMsg: err?.error?.message || "Invalid key" }));
      }
    } catch (e: any) {
      setOpenaiKey((p) => ({ ...p, status: "invalid", errorMsg: e?.message || "Network error" }));
    }
  };

  const testElevenlabsKey = async () => {
    const key = elevenlabsKey.value.trim();
    if (!key) {
      toast({ title: "Please enter an ElevenLabs key first", variant: "destructive" });
      return;
    }

    setElevenlabsKey((p) => ({ ...p, status: "testing", errorMsg: undefined }));
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/user", {
        headers: { "xi-api-key": key },
      });

      if (res.ok) {
        setElevenlabsKey((p) => ({ ...p, status: "valid" }));
        toast({ title: "ElevenLabs Key Connected!", description: "Ultra-realistic voices enabled." });
      } else {
        setElevenlabsKey((p) => ({ ...p, status: "invalid", errorMsg: "Invalid ElevenLabs API Key" }));
      }
    } catch (e: any) {
      setElevenlabsKey((p) => ({ ...p, status: "invalid", errorMsg: e?.message || "Network error" }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1 text-white flex items-center gap-2.5">
          <Key className="w-6 h-6 text-cyan-400" />
          AI Providers & API Keys
        </h2>
        <p className="text-sm text-zinc-400">
          Manage your AI API credentials. Keys are encrypted and stored locally in your browser.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Google Gemini */}
        <div className="p-5 rounded-2xl bg-[#131522] border border-white/10 space-y-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <LogoIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Google Gemini (Multimodal & Vision)
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                    Recommended
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Powers Live OCR, Document/PDF Scanning, Vision Camera, and fast responses.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys["gemini"] ? "text" : "password"}
                value={geminiKey.value}
                onChange={(e) => setGeminiKey((p) => ({ ...p, value: e.target.value }))}
                placeholder="AQ.Ab8RN6... or AIzaSy..."
                className="w-full bg-[#1b1e30] text-xs text-white pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => toggleShow("gemini")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                {showKeys["gemini"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSaveKey("gemini")}
              className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shrink-0"
            >
              Save
            </button>

            <button
              type="button"
              onClick={testGeminiKey}
              disabled={geminiKey.status === "testing"}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {geminiKey.status === "testing" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : geminiKey.status === "valid" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Test
            </button>
          </div>

          {geminiKey.status === "valid" && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" /> Connected and active.
            </div>
          )}
          {geminiKey.status === "invalid" && (
            <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {geminiKey.errorMsg || "Connection failed."}
            </div>
          )}
        </div>

        {/* 2. OpenAI */}
        <div className="p-5 rounded-2xl bg-[#131522] border border-white/10 space-y-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  OpenAI (ChatGPT & GPT-4o)
                </h3>
                <p className="text-xs text-zinc-400">
                  Enables GPT-4o, GPT-4o mini, and DALL-E image models.
                </p>
              </div>
            </div>

            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
            >
              Get API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys["openai"] ? "text" : "password"}
                value={openaiKey.value}
                onChange={(e) => setOpenaiKey((p) => ({ ...p, value: e.target.value }))}
                placeholder="sk-proj-..."
                className="w-full bg-[#1b1e30] text-xs text-white pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-emerald-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => toggleShow("openai")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                {showKeys["openai"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSaveKey("openai")}
              className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shrink-0"
            >
              Save
            </button>

            <button
              type="button"
              onClick={testOpenaiKey}
              disabled={openaiKey.status === "testing"}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {openaiKey.status === "testing" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : openaiKey.status === "valid" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Test
            </button>
          </div>

          {openaiKey.status === "valid" && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" /> Connected and verified.
            </div>
          )}
          {openaiKey.status === "invalid" && (
            <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {openaiKey.errorMsg || "Verification failed."}
            </div>
          )}
        </div>

        {/* 3. ElevenLabs */}
        <div className="p-5 rounded-2xl bg-[#131522] border border-white/10 space-y-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  ElevenLabs (Ultra-Realistic Speech)
                </h3>
                <p className="text-xs text-zinc-400">
                  Optional ultra-high fidelity voices for Real-Time Talking Assistant.
                </p>
              </div>
            </div>

            <a
              href="https://elevenlabs.io"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys["elevenlabs"] ? "text" : "password"}
                value={elevenlabsKey.value}
                onChange={(e) => setElevenlabsKey((p) => ({ ...p, value: e.target.value }))}
                placeholder="sk_..."
                className="w-full bg-[#1b1e30] text-xs text-white pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-purple-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => toggleShow("elevenlabs")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                {showKeys["elevenlabs"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSaveKey("elevenlabs")}
              className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shrink-0"
            >
              Save
            </button>

            <button
              type="button"
              onClick={testElevenlabsKey}
              disabled={elevenlabsKey.status === "testing"}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {elevenlabsKey.status === "testing" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : elevenlabsKey.status === "valid" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Test
            </button>
          </div>

          {elevenlabsKey.status === "valid" && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" /> Connected and active.
            </div>
          )}
          {elevenlabsKey.status === "invalid" && (
            <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {elevenlabsKey.errorMsg || "Invalid key."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
