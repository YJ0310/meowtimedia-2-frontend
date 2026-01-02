"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useBGM } from "@/lib/bgm-context";
import GlobalLoading from "@/components/global-loading";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

// Emoji ratings for ease of use
const EASE_EMOJIS = [
  { value: 1, emoji: "😵", label: "Super confusing" },
  { value: 2, emoji: "🤔", label: "A bit tricky" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Pretty easy" },
  { value: 5, emoji: "😊", label: "Super easy!" },
];

// Emoji ratings for recommendation
const RECOMMEND_EMOJIS = [
  { value: 1, emoji: "👎", label: "Probably not" },
  { value: 2, emoji: "🤷", label: "Maybe" },
  { value: 3, emoji: "😐", label: "Not sure" },
  { value: 4, emoji: "👍", label: "Likely" },
  { value: 5, emoji: "💯", label: "Definitely!" },
];

// First impression options
const FIRST_IMPRESSION_OPTIONS = [
  { value: "learning", label: "Learning about Asian countries and cultures" },
  { value: "planning", label: "Planning a trip to Asia" },
  { value: "games", label: "Playing travel-themed games" },
  { value: "not-sure", label: "I'm not really sure" },
  { value: "other", label: "Other" },
];

// Issues options
const ISSUE_OPTIONS = [
  { value: "none", label: "Nope, everything worked great! ✨" },
  { value: "slow", label: "Some things were a bit slow" },
  { value: "loading", label: "Something didn't load properly" },
  { value: "sound", label: "The sound/music didn't work" },
  { value: "button", label: "A button or link didn't work" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { startExperience, isAudioReady } = useBGM();
  const router = useRouter();

  // Form state
  const [firstImpression, setFirstImpression] = useState<string>("");
  const [firstImpressionOther, setFirstImpressionOther] = useState("");
  const [easeOfUse, setEaseOfUse] = useState<number>(0);
  const [issues, setIssues] = useState<string[]>([]);
  const [issuesOther, setIssuesOther] = useState("");
  const [recommendation, setRecommendation] = useState<number>(0);
  const [additionalFeedback, setAdditionalFeedback] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start music on click
  const handlePageClick = () => {
    if (!isAudioReady) {
      startExperience();
    }
  };

  // Check if user has already submitted feedback
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_BASE_URL}/feedback/status`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && data.hasSubmitted) {
          setHasAlreadySubmitted(true);
        }
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };
    checkFeedbackStatus();
  }, [user]);

  // Handle issue toggle
  const toggleIssue = (value: string) => {
    if (value === "none") {
      setIssues(["none"]);
    } else {
      const newIssues = issues.filter((i) => i !== "none");
      if (newIssues.includes(value)) {
        setIssues(newIssues.filter((i) => i !== value));
      } else {
        setIssues([...newIssues, value]);
      }
    }
  };

  // Calculate progress
  const totalSteps = 5;
  const completedSteps = [
    firstImpression,
    easeOfUse > 0,
    issues.length > 0,
    recommendation > 0,
    true, // Optional step
  ].filter(Boolean).length;

  // Submit feedback
  const handleSubmit = async () => {
    setError(null);

    // Validate required fields
    if (!firstImpression || !easeOfUse || !recommendation || issues.length === 0) {
      setError("Please answer all required questions");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstImpression,
          firstImpressionOther:
            firstImpression === "other" ? firstImpressionOther : undefined,
          easeOfUse,
          issues,
          issuesOther: issues.includes("other") ? issuesOther : undefined,
          recommendation,
          additionalFeedback: additionalFeedback || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to success page
        router.push('/feedback/success');
      } else {
        setError(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <GlobalLoading
        isLoading={true}
        title="Loading Feedback"
        subtitle="Preparing your survey..."
      />
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Already submitted
  if (hasAlreadySubmitted) {
    return (
      <div
        className="fixed inset-0 bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 overflow-y-auto"
        onClick={handlePageClick}
      >
        <div className="max-w-2xl mx-auto pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <h1 className="text-3xl font-bold mb-4 text-gradient">
              Thanks for Your Feedback!
            </h1>
            <p className="text-lg text-neutral-dark dark:text-gray-400 mb-6">
              You've already submitted your feedback. Your feedback stamp is in
              your passport!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/passport">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  View Passport
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
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 overflow-y-auto"
      onClick={handlePageClick}
    >
      <div className="max-w-2xl mx-auto pt-12 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/profile">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 left-4 glass p-3 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🐱
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Meowtimap Beta Test Survey
          </h1>
          <p className="text-neutral-dark dark:text-gray-400">
            Hey there! Thanks for trying out Meowtimap! 🙏
          </p>
          <p className="text-sm text-neutral-dark dark:text-gray-500 mt-1">
            This will only take about 1 minute!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-full h-3 mb-8 overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-strong border-2 border-red-400 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question 1: First Impressions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👀</span>
            <div>
              <h2 className="text-lg font-bold">Question 1: First Impressions</h2>
              <p className="text-sm text-neutral-dark dark:text-gray-400">
                After using the app for a few minutes, what do you think it's for?
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {FIRST_IMPRESSION_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFirstImpression(option.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  firstImpression === option.value
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary"
                    : "glass hover:bg-white/50 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      firstImpression === option.value
                        ? "border-primary bg-primary"
                        : "border-gray-400"
                    }`}
                  >
                    {firstImpression === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              </motion.button>
            ))}
            {firstImpression === "other" && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                type="text"
                placeholder="Please specify..."
                value={firstImpressionOther}
                onChange={(e) => setFirstImpressionOther(e.target.value)}
                className="w-full glass p-4 rounded-xl mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
        </motion.div>

        {/* Question 2: How Easy Was It? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📱</span>
            <div>
              <h2 className="text-lg font-bold">Question 2: How Easy Was It?</h2>
              <p className="text-sm text-neutral-dark dark:text-gray-400">
                How easy was it to figure out what to do in the app?
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            {EASE_EMOJIS.map((item) => (
              <motion.button
                key={item.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEaseOfUse(item.value)}
                className={`flex-1 p-4 rounded-xl text-center transition-all ${
                  easeOfUse === item.value
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary"
                    : "glass hover:bg-white/50 dark:hover:bg-white/10"
                }`}
              >
                <div className="text-3xl mb-1">{item.emoji}</div>
                <div className="text-xs text-neutral-dark dark:text-gray-400 hidden sm:block">
                  {item.label}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Question 3: Did Anything Break? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔧</span>
            <div>
              <h2 className="text-lg font-bold">Question 3: Did Anything Break?</h2>
              <p className="text-sm text-neutral-dark dark:text-gray-400">
                Did you run into any problems while using the app?
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {ISSUE_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleIssue(option.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  issues.includes(option.value)
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary"
                    : "glass hover:bg-white/50 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      issues.includes(option.value)
                        ? "border-primary bg-primary"
                        : "border-gray-400"
                    }`}
                  >
                    {issues.includes(option.value) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              </motion.button>
            ))}
            {issues.includes("other") && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                type="text"
                placeholder="Please describe the issue..."
                value={issuesOther}
                onChange={(e) => setIssuesOther(e.target.value)}
                className="w-full glass p-4 rounded-xl mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
        </motion.div>

        {/* Question 4: Would You Share It? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💬</span>
            <div>
              <h2 className="text-lg font-bold">Question 4: Would You Share It?</h2>
              <p className="text-sm text-neutral-dark dark:text-gray-400">
                Would you recommend Meowtimap to a friend who's curious about Asian
                culture?
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            {RECOMMEND_EMOJIS.map((item) => (
              <motion.button
                key={item.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRecommendation(item.value)}
                className={`flex-1 p-4 rounded-xl text-center transition-all ${
                  recommendation === item.value
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary"
                    : "glass hover:bg-white/50 dark:hover:bg-white/10"
                }`}
              >
                <div className="text-3xl mb-1">{item.emoji}</div>
                <div className="text-xs text-neutral-dark dark:text-gray-400 hidden sm:block">
                  {item.label}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Question 5: Any Other Thoughts? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💭</span>
            <div>
              <h2 className="text-lg font-bold">
                Question 5: Any Other Thoughts?{" "}
                <span className="text-sm font-normal text-neutral-dark dark:text-gray-400">
                  (Optional)
                </span>
              </h2>
              <p className="text-sm text-neutral-dark dark:text-gray-400">
                Is there anything else you'd like to tell us?
              </p>
            </div>
          </div>
          <textarea
            value={additionalFeedback}
            onChange={(e) => setAdditionalFeedback(e.target.value)}
            placeholder="Your thoughts here... 🐾"
            rows={4}
            className="w-full glass p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isSubmitting || completedSteps < 4}
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Submit Feedback
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </motion.button>
          <p className="text-sm text-neutral-dark dark:text-gray-500 mt-4">
            You're awesome for helping us make Meowtimap better! 🐾
          </p>
        </motion.div>
      </div>
    </div>
  );
}
