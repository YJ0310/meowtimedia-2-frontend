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
} from "lucide-react";
import { DonutChart, RatingHistogram, HorizontalBarChart } from "./charts";
import { FeedbackSummary, FeedbackResponse, FeedbackSubTab } from "../types";
import {
  FIRST_IMPRESSION_OPTIONS,
  ISSUE_OPTIONS,
  EASE_EMOJIS,
  RECOMMEND_EMOJIS,
} from "../constants";

// --- ANIMATION CONFIGS ---
const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: easeOut,
    },
  }),
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
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
}

// --- MAIN COMPONENT ---
export default function FeedbackTab({ summary, responses }: FeedbackTabProps) {
  const [activeTab, setActiveTab] = useState<FeedbackSubTab>("summary");
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Question definitions
  const questions: Question[] = useMemo(
    () => [
      { id: "impression", label: "What was your first impression?", shortLabel: "First Impression", icon: PieChart },
      { id: "ease", label: "How easy was it to use?", shortLabel: "Ease of Use", icon: ThumbsUp },
      { id: "issues", label: "Did you encounter any issues?", shortLabel: "Issues", icon: AlertTriangle },
      { id: "recommend", label: "How likely are you to recommend?", shortLabel: "Recommendation", icon: TrendingUp },
      { id: "feedback", label: "Any additional feedback?", shortLabel: "Feedback", icon: MessageSquare },
      { id: "referral", label: "How did you hear about us?", shortLabel: "Referral", icon: Award },
    ],
    []
  );

  // Tab config
  const tabs = useMemo(
    () => [
      { id: "summary" as FeedbackSubTab, label: "Summary", icon: BarChart3 },
      { id: "question" as FeedbackSubTab, label: "Question", icon: FileText },
      { id: "individual" as FeedbackSubTab, label: "Individual", icon: User },
    ],
    []
  );

  // Chart data
  const firstImpressionData = useMemo(() => {
    if (!summary) return [];
    const colors = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
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
        return response.firstImpression;
      case "ease":
        return `${response.easeOfUse} / 5`;
      case "issues":
        return (response.issues || []).join(", ") || "None reported";
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
        <div className="text-muted-foreground">Loading feedback data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen">
      {/* --- HEADER --- */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="px-4 md:px-6 pt-6 pb-4">
          {/* Title & Stats */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">Feedback Analysis</h1>
              <p className="text-sm text-muted-foreground mt-1">{summary.total} responses collected</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              {summary.total}
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <nav className="relative flex border-b border-transparent -mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={pageTransition}
                  />
                )}
              </button>
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
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: "Total", value: summary.total, color: "text-primary", bg: "bg-primary/5" },
                  { label: "Avg Ease", value: summary.avgEaseOfUse.toFixed(1), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5" },
                  { label: "Avg NPS", value: summary.avgRecommendation.toFixed(1), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/5" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    variants={cardVariants}
                    custom={i}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className={`${stat.bg} rounded-2xl p-4 md:p-5 border border-border/50`}
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Question Cards */}
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
                <QuestionSummaryCard index={1} question={questions[0].label}>
                  <DonutChart data={firstImpressionData} total={summary.total} />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={2} question={questions[1].label}>
                  <RatingHistogram data={summary.easeOfUse} total={summary.total} emojiMap={EASE_EMOJIS} />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={3} question={questions[2].label}>
                  <HorizontalBarChart data={issuesData.data} total={summary.total} maxVal={issuesData.max} colorMap={ISSUE_OPTIONS} />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={4} question={questions[3].label}>
                  <RatingHistogram data={summary.recommendation} total={summary.total} emojiMap={RECOMMEND_EMOJIS} />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={5} question={questions[4].label}>
                  <FeedbackTextList responses={responses} />
                </QuestionSummaryCard>

                <QuestionSummaryCard index={6} question={questions[5].label}>
                  <HorizontalBarChart data={referralData.data} total={summary.total} maxVal={referralData.max} />
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
              {/* Question Selector Pills */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-1 px-1 scrollbar-hide">
                {questions.map((q, i) => (
                  <motion.button
                    key={q.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedQuestionIndex(i)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedQuestionIndex === i
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-current/10 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="hidden sm:inline">{q.shortLabel}</span>
                  </motion.button>
                ))}
              </div>

              {/* Question Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5 mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <currentQuestion.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{currentQuestion.label}</h2>
                    <p className="text-sm text-muted-foreground">{filteredResponses.length} responses</p>
                  </div>
                </div>
              </motion.div>

              {/* Responses */}
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredResponses.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No responses for this question yet.</p>
                    </motion.div>
                  ) : (
                    filteredResponses.map((response, i) => (
                      <motion.div
                        key={response._id || i}
                        variants={cardVariants}
                        custom={i}
                        layout
                        className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <UserAvatar user={response.userId} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground leading-relaxed">
                              {getAnswerForQuestion(response, currentQuestion.id) || (
                                <span className="text-muted-foreground italic">No answer</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">{response.userId.displayName}</span>
                              <span className="opacity-50">•</span>
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
              <div className="bg-card border border-border rounded-2xl p-3 mb-4 flex items-center justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateResponse("prev")}
                  disabled={selectedResponseIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </motion.button>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedResponseIndex}
                      onChange={(e) => setSelectedResponseIndex(Number(e.target.value))}
                      className="appearance-none bg-muted/50 rounded-lg py-2 pl-3 pr-8 text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {responses.map((r, i) => (
                        <option key={i} value={i}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <span className="text-muted-foreground text-sm">of {responses.length}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateResponse("next")}
                  disabled={selectedResponseIndex === responses.length - 1}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Response Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedResponseIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {/* User Header */}
                  <div className="p-5 md:p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-4">
                      <UserAvatar user={currentResponse.userId} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg md:text-xl font-semibold text-foreground truncate">
                          {currentResponse.userId.displayName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{currentResponse.userId.email}</span>
                          </span>
                          <span className="hidden sm:inline opacity-50">•</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(currentResponse.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answers Grid */}
                  <div className="divide-y divide-border">
                    {questions.map((q, i) => {
                      const answer = getAnswerForQuestion(currentResponse, q.id);
                      return (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="p-4 md:p-5 hover:bg-muted/10 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <span className="text-xs font-bold text-primary">{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-muted-foreground mb-1">{q.label}</p>
                              <p className={`text-foreground ${!answer ? "text-muted-foreground italic text-sm" : ""}`}>
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

const QuestionSummaryCard = ({
  index,
  question,
  children,
}: {
  index: number;
  question: string;
  children: React.ReactNode;
}) => (
  <motion.div
    variants={cardVariants}
    custom={index}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
  >
    <div className="p-4 md:p-5 border-b border-border bg-muted/10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary">{index}</span>
      </div>
      <h3 className="font-medium text-foreground">{question}</h3>
    </div>
    <div className="p-4 md:p-6">{children}</div>
  </motion.div>
);

const UserAvatar = ({
  user,
  size = "md",
}: {
  user: { avatar?: string; displayName?: string };
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-lg",
  };

  const initial = user.displayName?.[0]?.toUpperCase() || "?";

  if (user.avatar) {
    return (
      <motion.img
        whileHover={{ scale: 1.05 }}
        src={user.avatar}
        alt={user.displayName || "User"}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-background shadow-sm`}
      />
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold ring-2 ring-background shadow-sm`}
    >
      {initial}
    </motion.div>
  );
};

const FeedbackTextList = ({ responses }: { responses: FeedbackResponse[] }) => {
  const feedbackResponses = useMemo(() => responses.filter((r) => r.additionalFeedback), [responses]);

  if (feedbackResponses.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No written feedback provided yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {feedbackResponses.map((r, i) => (
        <motion.div
          key={r._id || i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-muted/30 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <UserAvatar user={r.userId} size="sm" />
            <span className="text-xs text-muted-foreground font-medium">{r.userId.displayName}</span>
            <span className="text-xs text-muted-foreground/50">•</span>
            <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-foreground text-sm leading-relaxed pl-11">"{r.additionalFeedback}"</p>
        </motion.div>
      ))}
    </div>
  );
};