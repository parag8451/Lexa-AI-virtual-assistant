import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useRealtimeVoice() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      toast.success("Voice chat connected!");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      setCurrentTranscript("");
    },
    onMessage: (payload) => {
      console.log("Voice message:", payload);
      
      // Add message to the transcript
      const role = payload.role === "agent" ? "assistant" : "user";
      setMessages(prev => [...prev, {
        id: `${role}-${Date.now()}`,
        role,
        content: payload.message,
        timestamp: new Date(),
      }]);
      setCurrentTranscript("");
    },
    onError: (error) => {
      console.error("Voice conversation error:", error);
      toast.error("Voice connection error. Please try again.");
    },
  });

  const startConversation = useCallback(async () => {
    if (conversation.status === "connected") {
      return;
    }

    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token"
      );

      if (error || !data?.signed_url) {
        throw new Error(error?.message || "No token received");
      }

      // Start the conversation with WebSocket
      await conversation.startSession({
        signedUrl: data.signed_url,
      });

      toast.success("Voice chat started! Speak naturally.");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to start voice chat. Please check microphone permissions."
      );
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setMessages([]);
      setCurrentTranscript("");
      toast.info("Voice chat ended");
    } catch (error) {
      console.error("Failed to stop conversation:", error);
    }
  }, [conversation]);

  return {
    // State
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    isConnecting,
    messages,
    currentTranscript,
    
    // Methods
    startConversation,
    stopConversation,
    
    // Volume controls
    setVolume: conversation.setVolume,
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
  };
}
