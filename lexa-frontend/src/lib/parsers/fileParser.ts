export interface FileAttachment {
  id: string;
  name: string;
  type: string; // e.g. "image/png", "application/pdf", "text/plain"
  size: number;
  dataUrl: string; // full data URL (e.g. data:image/png;base64,...)
  base64Data: string; // raw base64 string without data:prefix
  textContent?: string; // extracted text content for text/code/csv/json files
  isImage: boolean;
  isPdf: boolean;
  isText: boolean;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isPdfMime(mime: string): boolean {
  return mime === "application/pdf" || mime.endsWith("/pdf");
}

export function isTextMimeOrExt(mime: string, name: string): boolean {
  if (mime.startsWith("text/")) return true;
  if (
    mime.includes("json") ||
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    mime.includes("xml") ||
    mime.includes("yaml") ||
    mime.includes("markdown") ||
    mime.includes("csv")
  ) {
    return true;
  }
  const textExtensions = [
    ".txt", ".md", ".json", ".csv", ".tsv", ".js", ".jsx", ".ts", ".tsx",
    ".py", ".java", ".cpp", ".c", ".h", ".cs", ".go", ".rs", ".rb", ".php",
    ".html", ".css", ".scss", ".sass", ".less", ".sql", ".sh", ".bash", ".zsh",
    ".yaml", ".yml", ".xml", ".env", ".gitignore", ".dockerfile", ".toml", ".ini"
  ];
  const lower = name.toLowerCase();
  return textExtensions.some((ext) => lower.endsWith(ext));
}

export async function parseFile(file: File): Promise<FileAttachment> {
  const id = `att_${Date.now()}_${crypto.randomUUID().slice(0, 7)}`;
  const isImage = isImageMime(file.type);
  const isPdf = isPdfMime(file.type);
  const isText = isTextMimeOrExt(file.type, file.name);

  // Read data URL (for images, pdfs, and general uploads)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  // Extract base64 payload
  const commaIndex = dataUrl.indexOf(",");
  const base64Data = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;

  let textContent: string | undefined;

  // If it's a text-based file, also read text content
  if (isText) {
    try {
      textContent = await new Promise<string>((resolve, reject) => {
        const textReader = new FileReader();
        textReader.onload = () => resolve(textReader.result as string);
        textReader.onerror = (err) => reject(err);
        textReader.readAsText(file);
      });
    } catch (e) {
      console.warn("Could not read file as text:", e);
    }
  }

  const mimeType = file.type || (isPdf ? "application/pdf" : isImage ? "image/jpeg" : "text/plain");

  return {
    id,
    name: file.name,
    type: mimeType,
    size: file.size,
    dataUrl,
    base64Data,
    textContent,
    isImage,
    isPdf,
    isText,
  };
}

export function createAttachmentFromCanvas(
  canvas: HTMLCanvasElement,
  name: string = `scan_${Date.now()}.jpg`
): FileAttachment {
  const id = `cam_${Date.now()}_${crypto.randomUUID().slice(0, 7)}`;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const commaIndex = dataUrl.indexOf(",");
  const base64Data = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;

  // Approximate byte size
  const size = Math.round((base64Data.length * 3) / 4);

  return {
    id,
    name,
    type: "image/jpeg",
    size,
    dataUrl,
    base64Data,
    isImage: true,
    isPdf: false,
    isText: false,
  };
}
