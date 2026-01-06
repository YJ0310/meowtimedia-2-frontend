"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getAllFunFacts } from "@/lib/funfacts-data";

// Global fun facts for when no country is specified
const globalFunFacts = [
  "Asia is home to 60% of the world's population! 🌏",
  "Rice is the staple food for over half the world's population! 🍚",
  "Asia has the highest and lowest points on Earth! 🏔️",
  "There are over 2,000 languages spoken in Asia! 🗣️",
  "The Great Wall of China is over 21,000 kilometers long! 🏯",
  "Japan has more than 6,800 islands! 🏝️",
  "Indonesia is the world's largest archipelago! 🌊",
  "India is the birthplace of chess! ♟️",
];

export default function Loading() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Get fun facts
  const funFacts = useMemo(() => {
    const allFacts = getAllFunFacts();
    return allFacts.length > 0 ? allFacts : globalFunFacts;
  }, []);

  // Randomize initial fact index on mount
  useEffect(() => {
    setCurrentFactIndex(Math.floor(Math.random() * funFacts.length));
  }, [funFacts.length]);

  // Rotate fun facts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [funFacts.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gradient">Preparing Your Journey</h2>
        <p className="text-muted-foreground mt-2">Loading your adventure...</p>
      </motion.div>
      
      {/* Fun Fact Display */}
      <div className="max-w-md px-4 text-center">
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
      </div>
      
      {/* Fun fact indicator dots */}
      <div className="flex gap-1.5 mt-2">
        {funFacts.slice(0, Math.min(5, funFacts.length)).map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              index === currentFactIndex % Math.min(5, funFacts.length)
                ? "bg-primary"
                : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
