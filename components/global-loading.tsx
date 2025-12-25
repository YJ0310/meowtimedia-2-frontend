"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SIMPLE_FUNFACTS, getAllFunFacts } from "@/lib/funfacts-data";

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
}

export default function GlobalLoading({ 
  isLoading, 
  title = "Preparing Your Journey",
  subtitle = "Loading your adventure...",
  countrySlug
}: GlobalLoadingProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Get the appropriate fun facts based on country or use all
  const funFacts = useMemo(() => {
    if (countrySlug && SIMPLE_FUNFACTS[countrySlug]) {
      return SIMPLE_FUNFACTS[countrySlug];
    }
    // Combine all fun facts for global/random loading
    const allFacts = getAllFunFacts();
    return allFacts.length > 0 ? allFacts : globalFunFacts;
  }, [countrySlug]);

  // Randomize initial fact index on mount
  useEffect(() => {
    setCurrentFactIndex(Math.floor(Math.random() * funFacts.length));
  }, [funFacts.length]);

  // Rotate fun facts every 3 seconds
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoading, funFacts.length]);

  // Reset index when country changes
  useEffect(() => {
    setCurrentFactIndex(0);
  }, [countrySlug]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
        >
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
            <h2 className="text-2xl font-bold text-gradient">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
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
