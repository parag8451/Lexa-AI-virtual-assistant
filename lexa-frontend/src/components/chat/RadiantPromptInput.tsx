import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Sparkles, Code2, Terminal, Globe, Layout, Radio, Mic, MicOff, ArrowUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AttachmentTray } from "./AttachmentTray";

export interface RadiantPromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  
  // States passed from parent
  designMode: string;
  setDesignMode: (mode: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  isListening: boolean;
  toggleSpeechRecognition: () => void;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  
  // Attachments
  attachments: any[];
  onAttachmentClick: () => void;
  onRemoveAttachment: (index: number) => void;
  onPreviewAttachment: (url: string) => void;
}

export function RadiantPromptInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Describe what you want to build...",
  designMode,
  setDesignMode,
  webSearchEnabled,
  setWebSearchEnabled,
  isListening,
  toggleSpeechRecognition,
  setIsVoiceAssistantOpen,
  attachments,
  onAttachmentClick,
  onRemoveAttachment,
  onPreviewAttachment,
}: RadiantPromptInputProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachments.length > 0) && !disabled) {
        onSubmit();
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className={`relative radiant-input-wrapper rounded-2xl bg-[#0a0a0c]/80 group ${inputFocused ? "focused" : ""}`}>
      {/* Animated Border */}
      <div className="radiant-input-border rounded-2xl"></div>
      
      {/* Input Content */}
      <div className="relative z-10 flex flex-col p-4 text-left">
        
        {/* Label */}
        <div className="text-xs text-zinc-500 px-2 mb-4">Ask Lexa</div>
        
        {/* Attachment Tray */}
        <AttachmentTray
          attachments={attachments}
          onRemove={onRemoveAttachment}
          onPreview={onPreviewAttachment}
        />
        
        {/* Input Row */}
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button" 
                onClick={onAttachmentClick}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-white transition-colors mb-1.5 cursor-pointer"
              >
                <Paperclip className="text-lg w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach file / document</TooltipContent>
          </Tooltip>
          
          {/* Text Input */}
          <div className="flex-1 min-h-[40px] flex items-center">
            <textarea 
              ref={inputRef}
              rows={1}
              value={value}
              onChange={onChange}
              onKeyDown={handleKeydown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-600 text-base md:text-lg font-light tracking-wide resize-none py-1.5"
              style={{ minHeight: '40px' }}
            />
          </div>
        </div>
        
        {/* Divider & Bottom Controls */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          
          {/* Mode Selector */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            <button 
              type="button"
              onClick={() => setDesignMode("assistant")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${designMode === "assistant" ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "text-zinc-500 hover:text-white"}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Assistant
            </button>
            <button 
              type="button"
              onClick={() => setDesignMode("code")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${designMode === "code" ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "text-zinc-500 hover:text-white"}`}
            >
              Code <Terminal className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={() => setDesignMode("web")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${designMode === "web" ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "text-zinc-500 hover:text-white"}`}
            >
              Web <Globe className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={() => setDesignMode("mobile")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${designMode === "mobile" ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "text-zinc-500 hover:text-white"}`}
            >
              App <Layout className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${webSearchEnabled ? "text-[#38BDF8]" : "text-zinc-500 hover:text-white"}`}
                >
                  <Globe className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Web Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={() => setIsVoiceAssistantOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Live Voice Assistant</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={toggleSpeechRecognition}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isListening ? "text-rose-400 bg-rose-500/20" : "text-zinc-500 hover:text-white"}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Voice Input</TooltipContent>
            </Tooltip>
            <button 
              type="button" 
              disabled={(!value.trim() && attachments.length === 0) || disabled}
              onClick={() => onSubmit()}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${value.trim() || attachments.length > 0 ? "bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
