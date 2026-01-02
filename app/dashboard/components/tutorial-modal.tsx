"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

interface TutorialModalProps {
  showTutorial: boolean;
  tutorialStep: number;
  onTutorialNext: () => void;
  onSkipTutorial: () => void;
  onEnableSound: () => void;
  onSkipSound: () => void;
}

export default function TutorialModal({
  showTutorial,
  tutorialStep,
  onTutorialNext,
  onSkipTutorial,
  onEnableSound,
  onSkipSound,
}: TutorialModalProps) {
  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/20 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 dark:border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
          >
            {/* Tutorial Steps */}
            {tutorialStep === 0 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Welcome to Meowtimap!
                </h2>
                <p className="text-black/80 dark:text-white/80">
                  Let&apos;s take a quick tour to help you get started on your
                  Asian cultural adventure!
                </p>
              </div>
            )}
            {tutorialStep === 1 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🗺️</div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Explore the Map
                </h2>
                <p className="text-black/80 dark:text-white/80">
                  Click on any{" "}
                  <span className="text-primary font-semibold">country pin</span>{" "}
                  on the map to learn about its culture, food, and traditions!
                </p>
              </div>
            )}
            {tutorialStep === 2 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">📚</div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Learn & Quiz
                </h2>
                <p className="text-black/80 dark:text-white/80">
                  Each country has fun facts and topics to explore. Take the{" "}
                  <span className="text-primary font-semibold">quiz</span> to
                  test your knowledge!
                </p>
              </div>
            )}
            {tutorialStep === 3 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🐾</div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Collect Stamps!
                </h2>
                <p className="text-black/80 dark:text-white/80">
                  Score{" "}
                  <span className="text-amber-500 font-semibold">
                    80% or higher
                  </span>{" "}
                  on a quiz to earn that country&apos;s stamp! View your
                  collection in{" "}
                  <span className="text-primary font-semibold">My Passport</span>
                  .
                </p>
              </div>
            )}
            {tutorialStep === 4 && (
              <div className="text-center space-y-4">
                <motion.div
                  className="text-6xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🎵
                </motion.div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Enable Sound?
                </h2>
                <p className="text-black/80 dark:text-white/80">
                  Meowtimap has{" "}
                  <span className="text-primary font-semibold">
                    beautiful background music
                  </span>{" "}
                  and sound effects for a more immersive experience!
                </p>
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-xl p-4 mt-4 border border-white/20 dark:border-white/10">
                  <p className="text-sm text-black/60 dark:text-white/60">
                    🔊 Theme music while exploring
                    <br />
                    🎮 Quiz music & sound effects
                    <br />
                    🎉 Celebration sounds
                  </p>
                </div>

                {/* Sound choice buttons */}
                <div className="flex flex-col gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEnableSound}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                  >
                    <Volume2 className="w-6 h-6" />
                    Yes, Enable Sound! 🎵
                  </motion.button>
                  <button
                    onClick={onSkipSound}
                    className="text-black/50 dark:text-white/50 text-sm hover:text-black/70 dark:hover:text-white/70 transition-colors py-2"
                  >
                    No thanks, I&apos;ll explore quietly
                  </button>
                </div>
              </div>
            )}

            {/* Progress Dots - only show for steps 0-3 */}
            {tutorialStep < 4 && (
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step === tutorialStep
                        ? "bg-primary w-6"
                        : step < tutorialStep
                        ? "bg-primary/50"
                        : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Buttons - hide on sound step (step 4) as it has its own buttons */}
            {tutorialStep < 4 && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onSkipTutorial}
                  className="flex-1 py-3 rounded-xl border border-white/30 dark:border-white/10 text-black dark:text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Skip
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onTutorialNext}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg"
                >
                  Next
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
