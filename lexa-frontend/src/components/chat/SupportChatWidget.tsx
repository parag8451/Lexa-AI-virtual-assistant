import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, HelpCircle, Book, Mail, 
  ExternalLink, ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const FAQ_ITEMS = [
  {
    question: "How do I use voice chat?",
    answer: "Click the microphone icon in the chat input to start voice recording. Lexa will transcribe your speech and respond. You can also enable text-to-speech in settings to hear responses.",
  },
  {
    question: "How does the memory feature work?",
    answer: "Lexa automatically remembers important information from your conversations. You can also manually add memories via the Personalization Hub. All memories are private and secure.",
  },
  {
    question: "Which AI models are available?",
    answer: "Lexa offers multiple tiers: Lexa Fast for quick responses, Lexa Balanced for everyday use, Lexa Pro for complex tasks, Lexa Expert for deep analysis, and Lexa Ultra for maximum performance. Switch models in the header or enable auto-routing.",
  },
  {
    question: "How do I enable web search?",
    answer: "Type '@web' before your query or use the globe icon to enable web search. Lexa will search the internet and provide responses with citations.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes! All your conversations and data are encrypted and stored securely. We never share your personal information with third parties.",
  },
];

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi! 👋 I'm here to help. What can I assist you with today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showFAQ, setShowFAQ] = useState(true);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowFAQ(false);

    // Simulate bot response
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response = "Thank you for your message! For detailed assistance, please check our FAQ or contact support@lexaai.com.";

      // Simple keyword matching for common questions
      if (lowerInput.includes("voice") || lowerInput.includes("speak") || lowerInput.includes("microphone")) {
        response = FAQ_ITEMS[0].answer;
      } else if (lowerInput.includes("memory") || lowerInput.includes("remember")) {
        response = FAQ_ITEMS[1].answer;
      } else if (lowerInput.includes("model") || lowerInput.includes("lexa")) {
        response = FAQ_ITEMS[2].answer;
      } else if (lowerInput.includes("search") || lowerInput.includes("web") || lowerInput.includes("internet")) {
        response = FAQ_ITEMS[3].answer;
      } else if (lowerInput.includes("secure") || lowerInput.includes("privacy") || lowerInput.includes("data")) {
        response = FAQ_ITEMS[4].answer;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleFAQClick = (faq: typeof FAQ_ITEMS[0]) => {
    setShowFAQ(false);
    const userMessage: Message = {
      id: Date.now().toString(),
      content: faq.question,
      isBot: false,
      timestamp: new Date(),
    };
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: faq.answer,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
          "gradient-primary shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-shadow duration-300",
          isOpen && "hidden"
        )}
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-[360px] max-w-[calc(100vw-3rem)]",
              "bg-card border border-border rounded-2xl shadow-2xl",
              "flex flex-col overflow-hidden"
            )}
            style={{ height: "500px", maxHeight: "calc(100vh - 6rem)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Lexa Support</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isBot ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                        message.isBot
                          ? "bg-muted rounded-tl-sm"
                          : "gradient-primary text-white rounded-br-sm"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {/* FAQ suggestions */}
                {showFAQ && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-muted-foreground font-medium">
                      Common Questions:
                    </p>
                    {FAQ_ITEMS.slice(0, 3).map((faq, index) => (
                      <button
                        key={index}
                        onClick={() => handleFAQClick(faq)}
                        className={cn(
                          "w-full p-3 rounded-xl text-left text-sm",
                          "bg-muted/50 hover:bg-muted",
                          "border border-border/50 hover:border-primary/30",
                          "transition-all flex items-center gap-2"
                        )}
                      >
                        <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                        <span className="flex-1 line-clamp-1">{faq.question}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick links */}
            <div className="px-4 py-2 border-t border-border/50 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                <Book className="w-3 h-3 mr-1" />
                Docs
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Button>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 h-10"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="gradient-primary h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
