"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Fun facts for each country
const countryFunFacts: Record<string, string[]> = {
  japan: [
    "Japan has more than 6,800 islands! 🏝️",
    "There are over 5.5 million vending machines in Japan! 🎰",
    "Japanese trains are so punctual, delays of 5+ minutes get an apology certificate! 🚅",
    "Cherry blossom viewing (Hanami) has been celebrated for over 1,000 years! 🌸",
    "Japan has a rabbit island with over 1,000 wild rabbits! 🐰",
  ],
  "south-korea": [
    "South Korea has the fastest internet speed in the world! 🌐",
    "Koreans add 1 year to their age at birth! 🎂",
    "There are more than 100 different kimchi varieties! 🥬",
    "Seoul has a 24/7 cafe culture with cafes for everything! ☕",
    "K-pop training can last 7+ years before debut! 🎤",
  ],
  thailand: [
    "Thailand is the only Southeast Asian country never colonized! 🇹🇭",
    "Bangkok's full name has 168 letters - the world's longest city name! 📝",
    "Thai people greet each other with a 'wai' - a prayer-like gesture! 🙏",
    "Thailand has over 40,000 Buddhist temples! 🛕",
    "The country was called Siam until 1939! 📜",
  ],
  malaysia: [
    "Malaysia has the world's oldest tropical rainforest at 130 million years! 🌳",
    "The country has 3 different cultures: Malay, Chinese, and Indian! 🎭",
    "Malaysian food blends flavors from across Asia! 🍛",
    "The Petronas Towers were the world's tallest from 1998-2004! 🏙️",
    "There are over 130 languages spoken in Malaysia! 🗣️",
  ],
  indonesia: [
    "Indonesia has over 17,000 islands and 300 ethnic groups! 🏝️",
    "It's the world's largest archipelago nation! 🗺️",
    "Komodo dragons only exist in Indonesia! 🦎",
    "Bali has a Day of Silence (Nyepi) where the whole island shuts down! 🤫",
    "Indonesia has the largest Buddhist temple in the world - Borobudur! 🛕",
  ],
  china: [
    "The Great Wall is over 13,000 miles long! 🧱",
    "China invented paper, printing, compass, and gunpowder! 📜",
    "Chinese writing has over 50,000 characters! ✍️",
    "Table tennis is the national sport of China! 🏓",
    "Tea was discovered in China nearly 5,000 years ago! 🍵",
  ],
  vietnam: [
    "Vietnam is the world's largest exporter of cashew nuts! 🥜",
    "Motorbikes outnumber cars 10 to 1! 🛵",
    "Vietnamese coffee culture is world-famous! ☕",
    "Ha Long Bay has nearly 2,000 limestone islands! 🏝️",
    "The country is shaped like the letter 'S'! 🗺️",
  ],
  singapore: [
    "Singapore is one of only 3 city-states in the world! 🏙️",
    "Chewing gum is banned (except for medical use)! 🚫",
    "It has the world's first night zoo! 🦁",
    "Singapore's Changi Airport has a waterfall inside! 💦",
    "The country has 4 official languages! 🗣️",
  ],
};

// Generic fun facts for global/random loading
const globalFunFacts = [
  "Asia is home to 60% of the world's population! 🌏",
  "Rice is the staple food for over half the world's population! 🍚",
  "Asia has the highest and lowest points on Earth! 🏔️",
  "The world's oldest civilization started in Asia! 📜",
  "Asia produces 90% of the world's rice! 🌾",
  "There are over 2,000 languages spoken in Asia! 🗣️",
  "Asian elephants have been domesticated for 4,000 years! 🐘",
  "The Great Wall of China is visible from space! 🚀",
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
  
  // Get the appropriate fun facts based on country or use global
  const funFacts = useMemo(() => {
    if (countrySlug && countryFunFacts[countrySlug]) {
      return countryFunFacts[countrySlug];
    }
    return globalFunFacts;
  }, [countrySlug]);

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
