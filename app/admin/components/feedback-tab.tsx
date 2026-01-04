"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import {
  ThumbsUp,
  TrendingUp,
  PieChart,
  AlertTriangle,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Users,
  BarChart3,
  User,
  FileText,
  ChevronDown,
  Sparkles,
  Quote,
} from "lucide-react";
import { DonutChart, RatingHistogram, HorizontalBarChart, StatCard } from "./charts";
import { FeedbackSummary, FeedbackResponse, FeedbackSubTab } from "../types";
import {
  FIRST_IMPRESSION_OPTIONS,
  ISSUE_OPTIONS,
  EASE_EMOJIS,
  RECOMMEND_EMOJIS,
} from "../constants";

// --- THEME COLORS ---
const THEME = {
  primary: "#a8bedf",
  secondary: "#c7d5e8",
  accent: "#efe4d4",
  neutral: "#d8c9ba",
};

// --- ANIMATION CONFIGS ---
const pageTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
};

// --- TYPES ---
interface FeedbackTabProps {
  summary: FeedbackSummary | null;
  responses: FeedbackResponse[];
}

interface Question {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}

// --- MAIN COMPONENT ---
export default function FeedbackTab({ summary, responses }: FeedbackTabProps) {
  const [activeTab, setActiveTab] = useState<FeedbackSubTab>("summary");
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Question definitions
  const questions: Question[] = useMemo(
    () => [
      { id: "impression", label: "What was your first impression?", shortLabel: "Impression", icon: PieChart, emoji: "✨" },
      { id: "ease", label: "How easy was it to use?", shortLabel: "Ease", icon: ThumbsUp, emoji: "🎯" },
      { id: "issues", label: "Did you encounter any issues?", shortLabel: "Issues", icon: AlertTriangle, emoji: "🔧" },
      { id: "recommend", label: "How likely are you to recommend?", shortLabel: "Recommend", icon: TrendingUp, emoji: "💫" },
      { id: "feedback", label: "Any additional feedback?", shortLabel: "Feedback", icon: MessageSquare, emoji: "💬" },
      { id: "referral", label: "How did you hear about us?", shortLabel: "Referral", icon: Award, emoji: "🎁" },
    ],
    []
  );

  // Tab config
  const tabs = useMemo(
    () => [
      { id: "summary" as FeedbackSubTab, label: "Summary", icon: BarChart3, emoji: "📊" },
      { id: "question" as FeedbackSubTab, label: "By Question", icon: FileText, emoji: "📝" },
      { id: "individual" as FeedbackSubTab, label: "Individual", icon: User, emoji: "👤" },
    ],
    []
  );

  // Chart data
  const firstImpressionData = useMemo(() => {
    if (!summary) return [];
    const colors = [THEME.primary, THEME.secondary, THEME.accent, THEME.neutral, "#b8d4e3"];
    return summary.firstImpression.map((item, index) => {
      const option = FIRST_IMPRESSION_OPTIONS.find((o) => o.value === item._id);
      return {
        label: option?.label || item._id,
        count: item.count,
        color: option?.color || colors[index % colors.length],
      };
    });
  }, [summary]);

  const issuesData = useMemo(() => {
    if (!summary) return { data: [], max: 0 };
    const processed = summary.issues.map((item) => ({
      label: ISSUE_OPTIONS.find((o) => o.value === item._id)?.label || item._id,
      value: item._id,
      count: item.count,
    }));
    processed.sort((a, b) => (a.value === "none" ? -1 : b.value === "none" ? 1 : b.count - a.count));
    return { data: processed, max: Math.max(...processed.map((i) => i.count), 1) };
  }, [summary]);

  const referralData = useMemo(() => {
    if (!summary) return { data: [], max: 0 };
    const processed = summary.referral.map((item) => ({
      label: item._id,
      value: item._id,
      count: item.count,
    }));
    processed.sort((a, b) => b.count - a.count);
    return { data: processed, max: Math.max(...processed.map((i) => i.count), 1) };
  }, [summary]);

  // Helpers
  const getAnswerForQuestion = useCallback((response: FeedbackResponse, questionId: string) => {
    switch (questionId) {
      case "impression":
        if (response.firstImpression === "other" && response.firstImpressionOther) {
          return `Other: ${response.firstImpressionOther}`;
        }
        const impressionOption = FIRST_IMPRESSION_OPTIONS.find(
          (o) => o.value === response.firstImpression
        );
        return impressionOption?.label || response.firstImpression;

      case "ease":
        return `${response.easeOfUse} / 5`;

      case "issues":
        if (!response.issues || response.issues.length === 0) {
          return "None reported";
        }
        const issueLabels = response.issues.map((issue) => {
          if (issue === "other" && response.issuesOther) {
            return `Other: ${response.issuesOther}`;
          }
          const issueOption = ISSUE_OPTIONS.find((o) => o.value === issue);
          return issueOption?.label || issue;
        });
        return issueLabels.join(", ");

      case "recommend":
        return `${response.recommendation} / 5`;

      case "feedback":
        return response.additionalFeedback || null;

      case "referral":
        return response.referral || "Direct / Organic";

      default:
        return null;
    }
  }, []);

  const filteredResponses = useMemo(() => {
    const current = questions[selectedQuestionIndex];
    if (current?.id === "feedback") {
      return responses.filter((r) => r.additionalFeedback);
    }
    return responses;
  }, [responses, selectedQuestionIndex, questions]);

  const currentResponse = responses[selectedResponseIndex];
  const currentQuestion = questions[selectedQuestionIndex];

  const navigateResponse = useCallback(
    (direction: "prev" | "next") => {
      setSelectedResponseIndex((prev) =>
        direction === "prev" ? Math.max(0, prev - 1) : Math.min(responses.length - 1, prev + 1)
      );
    },
    [responses.length]
  );

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-meow-primary/30 to-meow-accent/30 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-meow-primary" />
            </motion.div>
          </div>
          <p className="text-muted-foreground font-medium">Loading feedback data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen">
      {/* --- HEADER --- */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 glass-strong rounded-b-3xl"
      >
        <div className="px-5 md:px-8 pt-6 pb-5">
          {/* Title & Badge */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <span className="text-gradient">Feedback</span>
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-2xl"
                >
                  📊
                </motion.span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                Insights from {summary.total} amazing responses
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 glass px-4 py-2.5 rounded-2xl"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-meow-primary to-meow-secondary flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground leading-none">{summary.total}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">responses</p>
              </div>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-2 p-1 bg-muted/30 rounded-2xl">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 glass-strong rounded-xl"
                    transition={pageTransition}
                  />
                )}
                <span className="relative z-10 text-base">{tab.emoji}</span>
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* --- CONTENT --- */}
      <main className="px-4 md:px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* ========== SUMMARY VIEW ========== */}
          {activeTab === "summary" && (
            <motion.div
              key="summary"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {/* Quick Stats */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-3 gap-3 mb-8"
              >
                {[
                  {
                    label: "Responses",
                    value: summary.total,
                    emoji: "📬",
                    gradient: "from-meow-primary/20 to-meow-secondary/20",
                    border: "border-meow-primary/30",
                  },
                  {
                    label: "Avg Ease",
                    value: summary.avgEaseOfUse.toFixed(1),
                    emoji: "⭐",
                    gradient: "from-meow-accent/30 to-meow-neutral/20",
                    border: "border-meow-accent/30",
                  },
                  {
                    label: "Avg NPS",
                    value: summary.avgRecommendation.toFixed(1),
                    emoji: "💯",
                    gradient: "from-meow-secondary/20 to-meow-primary/20",
                    border: "border-meow-secondary/30",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    variants={cardVariants}
                    custom={i}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`glass rounded-3xl p-4 md:p-5 border ${stat.border} relative overflow-hidden group`}
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-300`} />
                    
                    {/* Emoji */}
                    <motion.span
                      className="absolute top-3 right-3 text-2xl opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {stat.emoji}
                    </motion.span>
                    
                    <div className="relative z-10">
                      <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        {stat.label}
                      </p>
                      <p className="text-3xl md:text-4xl font-bold text-gradient">
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Question Cards */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-5"
              >
                <QuestionSummaryCard index={1} question={questions[0]} color={THEME.primary}>
                  <DonutChart data={firstImpressionData} total={summary.total} title="Responses" />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={2} question={questions[1]} color={THEME.secondary}>
                  <RatingHistogram
                    data={summary.easeOfUse}
                    total={summary.total}
                    emojiConfig={EASE_EMOJIS}
                  />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={3} question={questions[2]} color={THEME.accent}>
                  <HorizontalBarChart
                    data={issuesData.data}
                    total={summary.total}
                  />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={4} question={questions[3]} color={THEME.neutral}>
                  <RatingHistogram
                    data={summary.recommendation}
                    total={summary.total}
                    emojiConfig={RECOMMEND_EMOJIS}
                  />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={5} question={questions[4]} color={THEME.primary}>
                  <FeedbackTextList responses={responses} />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={6} question={questions[5]} color={THEME.secondary}>
                  <HorizontalBarChart
                    data={referralData.data}
                    total={summary.total}
                  />
                </QuestionSummaryCard>
              </motion.div>
            </motion.div>
          )}

          {/* ========== QUESTION VIEW ========== */}
          {activeTab === "question" && (
            <motion.div
              key="question"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {/* Question Selector */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-5 -mx-2 px-2 scrollbar-hide">
                {questions.map((q, i) => (
                  <motion.button
                    key={q.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedQuestionIndex(i)}
                    className={`shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      selectedQuestionIndex === i
                        ? "glass-strong shadow-lg"
                        : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg">{q.emoji}</span>
                    <span className="hidden sm:inline">{q.shortLabel}</span>
                    {selectedQuestionIndex === i && (
                      <motion.div
                        layoutId="questionIndicator"
                        className="w-2 h-2 rounded-full bg-meow-primary"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Question Header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-3xl p-5 md:p-6 mb-5"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-14 h-14 rounded-2xl bg-linear-to-br from-meow-primary/30 to-meow-secondary/30 flex items-center justify-center text-2xl"
                  >
                    {currentQuestion.emoji}
                  </motion.div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-foreground">
                      {currentQuestion.label}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-semibold text-meow-primary">{filteredResponses.length}</span> responses
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Responses List */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredResponses.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass rounded-3xl p-12 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-meow-primary/20 to-meow-accent/20 flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium">No responses for this question yet.</p>
                    </motion.div>
                  ) : (
                    filteredResponses.map((response, i) => (
                      <motion.div
                        key={response._id || i}
                        variants={cardVariants}
                        custom={i}
                        layout
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="glass rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-lg group"
                      >
                        <div className="flex items-start gap-4">
                          <UserAvatar user={response.userId} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground leading-relaxed font-medium">
                              {getAnswerForQuestion(response, currentQuestion.id) || (
                                <span className="text-muted-foreground italic font-normal">No answer</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2.5 mt-3 text-xs text-muted-foreground">
                              <span className="font-semibold">{response.userId.displayName}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                              <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* ========== INDIVIDUAL VIEW ========== */}
          {activeTab === "individual" && responses.length > 0 && currentResponse && (
            <motion.div
              key="individual"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {/* Navigator */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-3xl p-4 mb-5 flex items-center justify-between gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateResponse("prev")}
                  disabled={selectedResponseIndex === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/50 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={selectedResponseIndex}
                      onChange={(e) => setSelectedResponseIndex(Number(e.target.value))}
                      className="appearance-none glass rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-meow-primary/50"
                    >
                      {responses.map((r, i) => (
                        <option key={i} value={i}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">of {responses.length}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateResponse("next")}
                  disabled={selectedResponseIndex === responses.length - 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/50 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Response Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedResponseIndex}
                  initial={{ opacity: 0, x: 40, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="glass-strong rounded-3xl overflow-hidden"
                >
                  {/* User Header */}
                  <div className="p-6 md:p-8 bg-linear-to-br from-meow-primary/10 via-meow-secondary/5 to-transparent">
                    <div className="flex items-center gap-5">
                      <UserAvatar user={currentResponse.userId} size="xl" />
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">
                          {currentResponse.userId.displayName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-2 truncate">
                            <div className="w-5 h-5 rounded-full bg-meow-primary/20 flex items-center justify-center">
                              <Mail className="w-3 h-3 text-meow-primary" />
                            </div>
                            <span className="truncate">{currentResponse.userId.email}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-meow-accent/30 flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-meow-neutral" />
                            </div>
                            {new Date(currentResponse.createdAt).toLocaleDateString(undefined, {
                              dateStyle: "medium",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="divide-y divide-border/50">
                    {questions.map((q, i) => {
                      const answer = getAnswerForQuestion(currentResponse, q.id);
                      return (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-5 md:p-6 hover:bg-muted/5 transition-colors group"
                        >
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="shrink-0 w-11 h-11 rounded-2xl bg-linear-to-br from-meow-primary/20 to-meow-secondary/20 flex items-center justify-center text-xl group-hover:from-meow-primary/30 group-hover:to-meow-secondary/30 transition-all"
                            >
                              {q.emoji}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                {q.shortLabel}
                              </p>
                              <p
                                className={`text-foreground font-medium ${
                                  !answer ? "text-muted-foreground italic font-normal text-sm" : ""
                                }`}
                              >
                                {answer || "No answer provided"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUBCOMPONENTS ---

interface QuestionSummaryCardProps {
  index: number;
  question: Question;
  color: string;
  children: React.ReactNode;
}

const QuestionSummaryCard = ({ index, question, color, children }: QuestionSummaryCardProps) => (
  <motion.div
    variants={cardVariants}
    custom={index}
    whileHover={{ y: -4, transition: { duration: 0.25 } }}
    className="glass rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-400"
  >
    {/* Header */}
    <div
      className="p-5 md:p-6 flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`,
        }}
      >
        {question.emoji}
      </motion.div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-base md:text-lg truncate">
          {question.label}
        </h3>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Question {index}
        </p>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-5 md:p-7">
      {children}
    </div>
  </motion.div>
);

interface UserAvatarProps {
  user: { avatar?: string; displayName?: string };
  size?: "sm" | "md" | "lg" | "xl";
}

const UserAvatar = ({ user, size = "md" }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-18 h-18 text-xl",
  };

  const sizePx = {
    sm: 40,
    md: 48,
    lg: 56,
    xl: 72,
  };

  const initial = user.displayName?.[0]?.toUpperCase() || "?";

  if (user.avatar) {
    return (
      <motion.img
        whileHover={{ scale: 1.08 }}
        src={user.avatar}
        alt={user.displayName || "User"}
        className={`${sizeClasses[size]} rounded-2xl object-cover ring-3 ring-background shadow-lg`}
        style={{ width: sizePx[size], height: sizePx[size] }}
      />
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className={`${sizeClasses[size]} rounded-2xl bg-linear-to-br from-meow-primary via-meow-secondary to-meow-accent text-white flex items-center justify-center font-bold ring-3 ring-background shadow-lg`}
      style={{ width: sizePx[size], height: sizePx[size] }}
    >
      {initial}
    </motion.div>
  );
};

interface FeedbackTextListProps {
  responses: FeedbackResponse[];
}

const FeedbackTextList = ({ responses }: FeedbackTextListProps) => {
  const feedbackResponses = useMemo(
    () => responses.filter((r) => r.additionalFeedback),
    [responses]
  );

  if (feedbackResponses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-meow-primary/20 to-meow-accent/20 flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground font-medium">No written feedback provided yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
      {feedbackResponses.map((r, i) => (
        <motion.div
          key={r._id || i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="glass p-5 rounded-2xl transition-all duration-300 group hover:shadow-lg"
        >
          {/* Quote mark */}
          <div className="absolute -top-1 -left-1 opacity-10 text-6xl font-serif text-meow-primary">
            "
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar user={r.userId} size="sm" />
              <div>
                <span className="text-sm font-semibold text-foreground">{r.userId.displayName}</span>
                <span className="block text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <p className="text-foreground leading-relaxed italic">
              "{r.additionalFeedback}"
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};