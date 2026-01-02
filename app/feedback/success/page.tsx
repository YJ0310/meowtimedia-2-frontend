"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useBGM } from "@/lib/bgm-context";
import GlobalLoading from "@/components/global-loading";

export default function FeedbackSuccessPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { startExperience, isAudioReady, playQuizResultMusic } = useBGM();
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  // Start music on click
  const handlePageClick = () => {
    if (!isAudioReady) {
      startExperience();
    }
  };

  // Play celebration music and show buttons after delay
  useEffect(() => {
    playQuizResultMusic();
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [playQuizResultMusic]);

  // Loading state
  if (authLoading) {
    return (
      <GlobalLoading
        isLoading={true}
        title="Loading"
        subtitle="Just a moment..."
      />
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 overflow-y-auto"
      onClick={handlePageClick}
    >
      {/* Floating confetti animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), 
              y: -50,
              rotate: 0,
              opacity: 1
            }}
            animate={{ 
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
              rotate: Math.random() * 720 - 360,
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3
            }}
          >
            {['🎉', '✨', '🌟', '🐾', '💫', '🎊'][i % 6]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto pt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mb-6"
          >
            <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-4 text-gradient"
          >
            Thank You! 🎉
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-neutral-dark dark:text-gray-400 mb-4"
          >
            Your feedback helps us make Meowtimap even better!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass p-6 rounded-2xl mb-6"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-neutral-dark dark:text-gray-400 mb-3"
            >
              🎁 You've earned a special stamp!
            </motion.p>
            <motion.img
              src="/stamp/feedback.png"
              alt="Feedback Stamp"
              className="w-40 h-40 mx-auto drop-shadow-2xl"
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: [0, -5, 5, 0], scale: 1 }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, repeatDelay: 1 },
                scale: { type: "spring", stiffness: 200, delay: 1.2 }
              }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-lg font-semibold mt-3 text-gradient"
            >
              Beta Tester Badge
            </motion.p>
          </motion.div>
          
          {/* Buttons - only show after delay */}
          <AnimatePresence>
            {showButtons ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 justify-center"
              >
                <Link href="/passport">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    View in Passport
                  </motion.button>
                </Link>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-neutral-dark dark:text-gray-400 text-sm"
              >
                ✨ Collecting your stamp...
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
