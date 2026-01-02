"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useBGM } from "@/lib/bgm-context";
import GlobalLoading from "@/components/global-loading";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

// --- ANIMATION CONFIGS ---
const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

const questionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// --- CONSTANTS ---
const EASE_EMOJIS = [
  { value: 1, emoji: "😵", label: "Super confusing" },
  { value: 2, emoji: "🤔", label: "A bit tricky" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Pretty easy" },
  { value: 5, emoji: "😊", label: "Super easy!" },
];

const RECOMMEND_EMOJIS = [
  { value: 1, emoji: "👎", label: "Probably not" },
  { value: 2, emoji: "🤷", label: "Maybe" },
  { value: 3, emoji: "😐", label: "Not sure" },
  { value: 4, emoji: "👍", label: "Likely" },
  { value: 5, emoji: "💯", label: "Definitely!" },
];

const FIRST_IMPRESSION_OPTIONS = [
  { value: "learning", label: "Learning about Asian countries and cultures", icon: "📚" },
  { value: "planning", label: "Planning a trip to Asia", icon: "✈️" },
  { value: "games", label: "Playing travel-themed games", icon: "🎮" },
  { value: "not-sure", label: "I'm not really sure", icon: "🤔" },
  { value: "other", label: "Other", icon: "💭" },
];

const ISSUE_OPTIONS = [
  { value: "none", label: "Nope, everything worked great!", icon: "✨" },
  { value: "slow", label: "Some things were a bit slow", icon: "🐌" },
  { value: "loading", label: "Something didn't load properly", icon: "❌" },
  { value: "sound", label: "The sound/music didn't work", icon: "🔇" },
  { value: "button", label: "A button or link didn't work", icon: "🔘" },
  { value: "other", label: "Other", icon: "📝" },
];

const REFERRAL_OPTIONS = [
  "Sek Yin Jia",
  "Foo Jia Qian",
  "Cheah Chio Yuen",
  "Errol Tay Lee Han",
  "Lee Chang Xin",
];

// --- QUESTION COMPONENT TYPES ---
interface QuestionConfig {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  required: boolean;
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: "firstImpression",
    emoji: "👀",
    title: "First Impressions",
    subtitle: "After using the app, what do you think it's for?",
    required: true,
  },
  {
    id: "easeOfUse",
    emoji: "📱",
    title: "Ease of Use",
    subtitle: "How easy was it to figure out what to do?",
    required: true,
  },
  {
    id: "issues",
    emoji: "🔧",
    title: "Technical Issues",
    subtitle: "Did you run into any problems?",
    required: true,
  },
  {
    id: "recommendation",
    emoji: "💬",
    title: "Would You Share It?",
    subtitle: "Would you recommend Meowtimap to a friend?",
    required: true,
  },
  {
    id: "additionalFeedback",
    emoji: "💭",
    title: "Any Other Thoughts?",
    subtitle: "Is there anything else you'd like to tell us?",
    required: false,
  },
  {
    id: "referral",
    emoji: "👥",
    title: "Who Referred You?",
    subtitle: "Select the person who introduced you to this app",
    required: true,
  },
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
  const [referral, setReferral] = useState<string>("");

  // Navigation state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState(0);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate completion status for each question
  const questionStatus = useMemo(() => ({
    firstImpression: !!firstImpression,
    easeOfUse: easeOfUse > 0,
    issues: issues.length > 0,
    recommendation: recommendation > 0,
    additionalFeedback: true, // Optional
    referral: !!referral,
  }), [firstImpression, easeOfUse, issues, recommendation, referral]);

  const completedCount = useMemo(() => {
    const required = [
      questionStatus.firstImpression,
      questionStatus.easeOfUse,
      questionStatus.issues,
      questionStatus.recommendation,
      questionStatus.referral,
    ];
    return required.filter(Boolean).length;
  }, [questionStatus]);

  const canSubmit = completedCount === 5;

  // Check current question completion
  const isCurrentComplete = useMemo(() => {
    const q = QUESTIONS[currentQuestion];
    return questionStatus[q.id as keyof typeof questionStatus];
  }, [currentQuestion, questionStatus]);

  // Start music on click
  const handlePageClick = () => {
    if (!isAudioReady) {
      startExperience();
    }
  };

  // Navigation
  const goToQuestion = (index: number) => {
    setDirection(index > currentQuestion ? 1 : -1);
    setCurrentQuestion(index);
    setError(null);
  };

  const goNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    }
  };

  // Check feedback status
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

  // Submit feedback
  const handleSubmit = async () => {
    setError(null);

    if (!canSubmit) {
      setError("Please answer all required questions");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstImpression,
          firstImpressionOther: firstImpression === "other" ? firstImpressionOther : undefined,
          easeOfUse,
          issues,
          issuesOther: issues.includes("other") ? issuesOther : undefined,
          recommendation,
          additionalFeedback: additionalFeedback || undefined,
          referral,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/feedback/success");
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
  if (!user) return null;

  // Already submitted
  if (hasAlreadySubmitted) {
    return (
      <div
        className="fixed inset-0 bg-background flex items-center justify-center p-4"
        onClick={handlePageClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Thanks for Your Feedback!
          </h1>
          <p className="text-muted-foreground mb-8">
            You've already submitted your feedback. Check your passport for the feedback stamp!
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/passport">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-4 h-4" />
                View Passport
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-muted text-foreground px-5 py-3 rounded-xl font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-background overflow-hidden"
      onClick={handlePageClick}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/profile">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </motion.button>
            </Link>

            <div className="text-center">
              <h1 className="text-sm font-semibold text-foreground">Beta Feedback</h1>
              <p className="text-xs text-muted-foreground">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </p>
            </div>

            <div className="w-9" /> {/* Spacer for alignment */}
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {QUESTIONS.map((q, i) => {
              const isComplete = questionStatus[q.id as keyof typeof questionStatus];
              const isCurrent = i === currentQuestion;

              return (
                <motion.button
                  key={q.id}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => goToQuestion(i)}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : isComplete
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}

                  {/* Required indicator */}
                  {q.required && !isComplete && !isCurrent && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-32 px-4 h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-destructive text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Cards */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              {/* Question Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-5xl mb-4"
                >
                  {QUESTIONS[currentQuestion].emoji}
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {QUESTIONS[currentQuestion].title}
                  {!QUESTIONS[currentQuestion].required && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (Optional)
                    </span>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {QUESTIONS[currentQuestion].subtitle}
                </p>
              </div>

              {/* Question Content */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                {/* Question 1: First Impressions */}
                {currentQuestion === 0 && (
                  <div className="space-y-3">
                    {FIRST_IMPRESSION_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.value}
                        selected={firstImpression === option.value}
                        onClick={() => setFirstImpression(option.value)}
                        icon={option.icon}
                        label={option.label}
                        type="radio"
                      />
                    ))}
                    <AnimatePresence>
                      {firstImpression === "other" && (
                        <motion.input
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          type="text"
                          placeholder="Please specify..."
                          value={firstImpressionOther}
                          onChange={(e) => setFirstImpressionOther(e.target.value)}
                          className="w-full bg-muted/50 border border-border p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Question 2: Ease of Use */}
                {currentQuestion === 1 && (
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {EASE_EMOJIS.map((item) => (
                      <EmojiButton
                        key={item.value}
                        selected={easeOfUse === item.value}
                        onClick={() => setEaseOfUse(item.value)}
                        emoji={item.emoji}
                        label={item.label}
                      />
                    ))}
                  </div>
                )}

                {/* Question 3: Issues */}
                {currentQuestion === 2 && (
                  <div className="space-y-3">
                    {ISSUE_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.value}
                        selected={issues.includes(option.value)}
                        onClick={() => toggleIssue(option.value)}
                        icon={option.icon}
                        label={option.label}
                        type="checkbox"
                      />
                    ))}
                    <AnimatePresence>
                      {issues.includes("other") && (
                        <motion.input
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          type="text"
                          placeholder="Please describe the issue..."
                          value={issuesOther}
                          onChange={(e) => setIssuesOther(e.target.value)}
                          className="w-full bg-muted/50 border border-border p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Question 4: Recommendation */}
                {currentQuestion === 3 && (
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {RECOMMEND_EMOJIS.map((item) => (
                      <EmojiButton
                        key={item.value}
                        selected={recommendation === item.value}
                        onClick={() => setRecommendation(item.value)}
                        emoji={item.emoji}
                        label={item.label}
                      />
                    ))}
                  </div>
                )}

                {/* Question 5: Additional Feedback */}
                {currentQuestion === 4 && (
                  <textarea
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Your thoughts here... 🐾"
                    rows={5}
                    className="w-full bg-muted/30 border border-border p-4 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}

                {/* Question 6: Referral */}
                {currentQuestion === 5 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {REFERRAL_OPTIONS.map((name) => (
                      <motion.button
                        key={name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setReferral(name)}
                        className={`p-4 rounded-xl text-center font-medium transition-all border ${
                          referral === name
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted/30 border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {name}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goPrev}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </motion.button>

            {/* Progress Indicator */}
            <div className="flex-1 text-center">
              <span className="text-sm text-muted-foreground">
                {completedCount}/5 required
              </span>
            </div>

            {/* Next / Submit Button */}
            {currentQuestion < QUESTIONS.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNext}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  isCurrentComplete
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Submit</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS ---

const OptionButton = ({
  selected,
  onClick,
  icon,
  label,
  type,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  type: "radio" | "checkbox";
}) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-4 ${
      selected
        ? "bg-primary/10 border-primary"
        : "bg-muted/30 border-border hover:border-primary/50"
    }`}
  >
    {/* Checkbox/Radio indicator */}
    <div
      className={`w-5 h-5 flex-shrink-0 flex items-center justify-center transition-all ${
        type === "radio" ? "rounded-full" : "rounded-md"
      } border-2 ${
        selected ? "border-primary bg-primary" : "border-muted-foreground/40"
      }`}
    >
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {type === "radio" ? (
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
            ) : (
              <Check className="w-3 h-3 text-primary-foreground" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Icon */}
    <span className="text-xl flex-shrink-0">{icon}</span>

    {/* Label */}
    <span
      className={`text-sm ${
        selected ? "text-foreground font-medium" : "text-muted-foreground"
      }`}
    >
      {label}
    </span>
  </motion.button>
);

const EmojiButton = ({
  selected,
  onClick,
  emoji,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.08, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
      selected
        ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
        : "bg-muted/30 border-border hover:border-primary/50"
    }`}
  >
    <motion.span
      className="text-2xl sm:text-3xl"
      animate={selected ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {emoji}
    </motion.span>
    <span
      className={`text-[10px] sm:text-xs text-center px-1 leading-tight ${
        selected ? "text-primary font-medium" : "text-muted-foreground"
      }`}
    >
      {label}
    </span>
  </motion.button>
);