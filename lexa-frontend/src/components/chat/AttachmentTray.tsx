import React from "react";
import { FileText, FileCode, X } from "lucide-react";
import { FileAttachment, formatFileSize } from "@/lib/fileParser";

export function AttachmentTray({
  attachments,
  onRemove,
  onPreview,
}: {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  onPreview: (url: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2.5 p-2 bg-[#12141e]/90 border border-white/10 rounded-2xl">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="relative flex items-center gap-2 p-1.5 pr-2.5 bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 rounded-xl text-xs text-zinc-200 transition-colors group"
        >
          {att.isImage ? (
            <img
              src={att.dataUrl}
              alt={att.name}
              onClick={() => onPreview(att.dataUrl)}
              className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
            />
          ) : att.isPdf ? (
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FileText className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
          )}

          <div className="flex flex-col min-w-0 pr-1">
            <span className="truncate max-w-[120px] font-medium">{att.name}</span>
            <span className="text-[10px] text-zinc-400">{formatFileSize(att.size)}</span>
          </div>

          <button
            type="button"
            onClick={() => onRemove(att.id)}
            className="w-4 h-4 rounded-full bg-white/10 hover:bg-rose-500/30 hover:text-rose-400 flex items-center justify-center text-zinc-400 transition-colors cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
