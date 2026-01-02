"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  MapPin,
  BookOpen,
  Award,
  Music,
  Sparkles,
  X,
} from "lucide-react";

// --- ANIMATION CONFIGS ---
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    } as const,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
} as const;

const contentVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    } as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
} as const;

const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  } as const,
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  } as const,
};

// --- TYPES ---
interface TutorialModalProps {
  showTutorial: boolean;
  tutorialStep: number;
  onTutorialNext: () => void;
  onSkipTutorial: () => void;
  onEnableSound: () => void;
  onSkipSound: () => void;
}

interface StepConfig {
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: React.ReactNode;
  color: string;
  bgColor: string;
}

// --- STEP CONFIGURATIONS ---
const STEPS: StepConfig[] = [
  {
    emoji: "🎉",
    icon: Sparkles,
    title: "Welcome to Meowtimap!",
    description: (
      <>
        Let's take a quick tour to help you get started on your{" "}
        <span className="text-primary font-semibold">Asian cultural adventure</span>!
      </>
    ),
    color: "text-violet-500",
    bgColor: "bg-violet-500",
  },
  {
    emoji: "🗺️",
    icon: MapPin,
    title: "Explore the Map",
    description: (
      <>
        Click on any <span className="text-primary font-semibold">country pin</span> on
        the map to learn about its culture, food, and traditions!
      </>
    ),
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    emoji: "📚",
    icon: BookOpen,
    title: "Learn & Quiz",
    description: (
      <>
        Each country has fun facts and topics to explore. Take the{" "}
        <span className="text-primary font-semibold">quiz</span> to test your knowledge!
      </>
    ),
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
  },
  {
    emoji: "🐾",
    icon: Award,
    title: "Collect Stamps!",
    description: (
      <>
        Score <span className="text-amber-500 font-semibold">80% or higher</span> on a
        quiz to earn that country's stamp! View your collection in{" "}
        <span className="text-primary font-semibold">My Passport</span>.
      </>
    ),
    color: "text-amber-500",
    bgColor: "bg-amber-500",
  },
  {
    emoji: "🎵",
    icon: Music,
    title: "Enable Sound?",
    description: (
      <>
        Meowtimap has{" "}
        <span className="text-primary font-semibold">beautiful background music</span>{" "}
        and sound effects for a more immersive experience!
      </>
    ),
    color: "text-pink-500",
    bgColor: "bg-pink-500",
  },
];

// --- MAIN COMPONENT ---
export default function TutorialModal({
  showTutorial,
  tutorialStep,
  onTutorialNext,
  onSkipTutorial,
  onEnableSound,
  onSkipSound,
}: TutorialModalProps) {
  const [direction, setDirection] = useState(0);
  const [prevStep, setPrevStep] = useState(tutorialStep);

  // Track direction for animations
  useEffect(() => {
    if (tutorialStep !== prevStep) {
      setDirection(tutorialStep > prevStep ? 1 : -1);
      setPrevStep(tutorialStep);
    }
  }, [tutorialStep, prevStep]);

  const currentStep = STEPS[tutorialStep] || STEPS[0];
  const isLastStep = tutorialStep === STEPS.length - 1;

  const handleNext = () => {
    setDirection(1);
    onTutorialNext();
  };

  const handlePrev = () => {
    if (tutorialStep > 0) {
      setDirection(-1);
      // Note: You might need to add an onTutorialPrev prop if going back is needed
    }
  };

  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 ${currentStep.bgColor}/5 pointer-events-none`}
            />

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSkipTutorial}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Progress Bar */}
            <div className="relative h-1 bg-muted">
              <motion.div
                className={`h-full ${currentStep.bgColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${((tutorialStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Step Indicator */}
              <div className="flex justify-center gap-2 mb-8">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    className={`relative flex items-center justify-center transition-all duration-300 ${
                      i === tutorialStep
                        ? "w-10 h-10"
                        : i < tutorialStep
                        ? "w-8 h-8"
                        : "w-8 h-8"
                    }`}
                  >
                    {/* Background Circle */}
                    <motion.div
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        i === tutorialStep
                          ? `${step.bgColor}/20 ring-2 ring-offset-2 ring-offset-card ${step.bgColor.replace("bg-", "ring-")}`
                          : i < tutorialStep
                          ? `${STEPS[i].bgColor}/20`
                          : "bg-muted"
                      }`}
                      animate={i === tutorialStep ? pulseAnimation : {}}
                    />

                    {/* Icon/Number */}
                    <span
                      className={`relative z-10 text-sm font-bold ${
                        i === tutorialStep
                          ? step.color
                          : i < tutorialStep
                          ? STEPS[i].color
                          : "text-muted-foreground"
                      }`}
                    >
                      {i < tutorialStep ? "✓" : i + 1}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Animated Content */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={tutorialStep}
                  custom={direction}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center"
                >
                  {/* Emoji/Icon */}
                  <motion.div
                    animate={floatAnimation}
                    className="relative inline-block mb-6"
                  >
                    <div className="text-6xl md:text-7xl">{currentStep.emoji}</div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl ${currentStep.bgColor}/20 flex items-center justify-center`}
                    >
                      <currentStep.icon className={`w-4 h-4 ${currentStep.color}`} />
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold text-foreground mb-3"
                  >
                    {currentStep.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {currentStep.description}
                  </motion.p>

                  {/* Sound Step Extra Content */}
                  {isLastStep && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6"
                    >
                      {/* Sound Features */}
                      <div className="bg-muted/30 border border-border rounded-2xl p-4 mb-6">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { icon: "🔊", label: "Theme Music" },
                            { icon: "🎮", label: "Quiz Sounds" },
                            { icon: "🎉", label: "Celebrations" },
                          ].map((item, i) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                              className="text-center"
                            >
                              <div className="text-2xl mb-1">{item.icon}</div>
                              <p className="text-xs text-muted-foreground">
                                {item.label}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Sound Choice Buttons */}
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onEnableSound}
                          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                        >
                          <Volume2 className="w-5 h-5" />
                          Yes, Enable Sound!
                          <Music className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={onSkipSound}
                          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-muted/50 text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-all"
                        >
                          <VolumeX className="w-4 h-4" />
                          No thanks, explore quietly
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation - Hide on last step */}
            {!isLastStep && (
              <div className="px-6 pb-6 md:px-8 md:pb-8">
                <div className="flex gap-3">
                  {/* Skip Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSkipTutorial}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-muted/50 text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-all"
                  >
                    Skip Tour
                  </motion.button>

                  {/* Next Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl ${currentStep.bgColor} text-white font-semibold shadow-lg transition-all`}
                    style={{
                      boxShadow: `0 10px 25px -5px ${
                        currentStep.bgColor.includes("violet")
                          ? "rgba(139, 92, 246, 0.3)"
                          : currentStep.bgColor.includes("blue")
                          ? "rgba(59, 130, 246, 0.3)"
                          : currentStep.bgColor.includes("emerald")
                          ? "rgba(16, 185, 129, 0.3)"
                          : currentStep.bgColor.includes("amber")
                          ? "rgba(245, 158, 11, 0.3)"
                          : "rgba(139, 92, 246, 0.3)"
                      }`,
                    }}
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Decorative Elements */}
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}