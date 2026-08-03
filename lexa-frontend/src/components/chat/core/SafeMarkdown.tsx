import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

// Configure DOMPurify to be strict
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "code", "pre",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote",
    "a", "table", "thead", "tbody", "tr", "th", "td",
    "hr", "div", "span"
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ["script", "style", "iframe", "form", "input", "button", "object", "embed"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
};

// Sanitize content before rendering
function sanitizeContent(content: string): string {
  // First pass: basic sanitization
  let sanitized = DOMPurify.sanitize(content, PURIFY_CONFIG) as string;
  
  // Remove any javascript: URLs that might have slipped through
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "data-blocked:");
  
  return sanitized;
}

export const SafeMarkdown = memo(function SafeMarkdown({ 
  content, 
  className = "" 
}: SafeMarkdownProps) {
  // Sanitize the content before rendering
  const sanitizedContent = useMemo(() => sanitizeContent(content), [content]);

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none text-[#f0f2f5] ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            
            if (isInline) {
              return (
                <code 
                  className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5" 
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group/code my-4 rounded-xl overflow-hidden border border-white/15 shadow-2xl bg-[#0d1117]">
                {/* Code header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10">
                  <span className="text-xs text-cyan-400 font-mono font-medium uppercase tracking-wider">
                    {match[1]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 opacity-80 group-hover/code:opacity-100 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(String(children));
                      toast.success("Code copied!");
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="!m-0 !rounded-t-none !bg-[#0d1117] text-sm font-mono"
                  customStyle={{ 
                    margin: 0, 
                    borderRadius: 0,
                    padding: '1.1rem',
                    background: '#0d1117',
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
          p({ children }) {
            return <p className="mb-3.5 last:mb-0 leading-7 text-[#f0f2f5] text-[15px]">{children}</p>;
          },
          strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-zinc-200">{children}</em>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-[#f0f2f5]">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-[#f0f2f5]">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-[#f0f2f5] leading-7">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 text-white tracking-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 text-white tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 text-white">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-cyan-500/60 pl-4 italic text-zinc-300 my-4 bg-cyan-500/5 py-2.5 rounded-r-lg border border-y-0 border-r-0">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            let safeHref = href || "#";
            try {
              const url = new URL(safeHref, window.location.origin);
              if (!["http:", "https:", "mailto:"].includes(url.protocol)) {
                safeHref = "#";
              }
            } catch {
              safeHref = "#";
            }

            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 inline-flex items-center gap-1 transition-colors font-medium"
              >
                {children}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md">
                <table className="w-full border-collapse text-left text-sm text-[#f0f2f5]">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return <th className="border-b border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white">{children}</th>;
          },
          td({ children }) {
            return <td className="border-b border-white/5 px-4 py-2.5 text-zinc-200">{children}</td>;
          },
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
});
