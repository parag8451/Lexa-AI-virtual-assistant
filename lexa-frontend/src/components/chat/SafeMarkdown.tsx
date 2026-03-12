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
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            
            if (isInline) {
              return (
                <code 
                  className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group/code my-4 rounded-xl overflow-hidden border border-border/50 shadow-lg">
                {/* Code header */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50">
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    {match[1]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs opacity-0 group-hover/code:opacity-100 transition-opacity"
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
                  className="!m-0 !rounded-t-none !bg-[#0d1117] text-sm"
                  customStyle={{ 
                    margin: 0, 
                    borderRadius: 0,
                    padding: '1rem',
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-7 text-foreground">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-foreground leading-7">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 text-foreground gradient-text">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 text-foreground">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 text-foreground">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 py-2 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            // Validate URL - only allow http, https, and mailto protocols
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
                className="text-primary hover:text-primary/80 underline underline-offset-4 inline-flex items-center gap-1 transition-colors"
              >
                {children}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return <th className="border border-border bg-muted/50 px-4 py-2 text-left font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-border px-4 py-2">{children}</td>;
          },
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
});
