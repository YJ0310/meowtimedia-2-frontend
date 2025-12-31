"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { SIMPLE_FUNFACTS, getAllFunFacts } from "@/lib/funfacts-data";
import { useBGM } from "@/lib/bgm-context";

// Global fun facts for when no country is specified
const globalFunFacts = [
  "Asia is home to 60% of the world's population! 🌏",
  "Rice is the staple food for over half the world's population! 🍚",
  "Asia has the highest and lowest points on Earth! 🏔️",
  "There are over 2,000 languages spoken in Asia! 🗣️",
];

interface GlobalLoadingProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  countrySlug?: string; // Optional: show country-specific fun facts
  showStartButton?: boolean; // Show start button for initial load
}

export default function GlobalLoading({ 
  isLoading, 
  title = "Preparing Your Journey",
  subtitle = "Loading your adventure...",
  countrySlug,
  showStartButton = false
}: GlobalLoadingProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const { isAudioLoaded, startExperience, isSoundEnabled } = useBGM();

  // Get the appropriate fun facts based on country or use all
  const funFacts = useMemo(() => {
    if (countrySlug && SIMPLE_FUNFACTS[countrySlug]) {
      return SIMPLE_FUNFACTS[countrySlug];
    }
    // Combine all fun facts for global/random loading
    const allFacts = getAllFunFacts();
    return allFacts.length > 0 ? allFacts : globalFunFacts;
  }, [countrySlug]);

  // Randomize initial fact index on mount and when country changes
  useEffect(() => {
    setCurrentFactIndex(Math.floor(Math.random() * funFacts.length));
  }, [funFacts.length, countrySlug]);

  // Rotate fun facts every 3 seconds
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoading, funFacts.length]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
        >
          {/* Show loader while audio is loading, then show start button */}
          {showStartButton && !isAudioLoaded ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-primary" />
            </motion.div>
          ) : showStartButton && isAudioLoaded ? (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={startExperience}
              className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <Play className="w-12 h-12 text-white ml-1" fill="white" />
            </motion.button>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-primary" />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gradient">
              {showStartButton && isAudioLoaded ? "Welcome to Meowtimap!" : title}
            </h2>
            <p className="text-muted-foreground mt-2">
              {showStartButton && isAudioLoaded 
                ? (isSoundEnabled ? "Click to start your adventure with music 🎵" : "Click to start your adventure")
                : subtitle}
            </p>
          </motion.div>
          
          {/* Fun Fact Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-md px-4 text-center"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentFactIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground italic"
              >
                💡 {funFacts[currentFactIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {['/japan.gif', '/south korea.gif', '/thailand.gif', '/malaysia.gif', '/indonesia.gif'].map((flag, i) => (
              <motion.img
                key={i}
                src={flag}
                alt="Flag"
                className="w-8 h-8 object-contain"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
