import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntroVideoSplashProps {
  videoSrc: string;
  onComplete: () => void;
}

export default function IntroVideoSplash({ videoSrc, onComplete }: IntroVideoSplashProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show skip button after 2 seconds
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog);
    }
  };

  const handleVideoEnd = () => {
    setIsEnding(true);
    setTimeout(onComplete, 500);
  };

  const handleSkip = () => {
    setIsEnding(true);
    setTimeout(onComplete, 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {!isEnding && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          {/* HD Video - No blur, object-fit: cover for fullscreen */}
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              objectFit: 'cover',
              imageRendering: 'auto',
              filter: 'none'
            }}
          />

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              {/* Mute/Unmute button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 backdrop-blur-sm rounded-full w-12 h-12"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>

              {/* Skip button */}
              {showSkip && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-white hover:bg-white/20 backdrop-blur-sm gap-2 px-6 py-2 rounded-full"
                  >
                    Skip
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
