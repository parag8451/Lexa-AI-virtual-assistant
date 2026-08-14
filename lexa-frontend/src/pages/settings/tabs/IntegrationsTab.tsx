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
