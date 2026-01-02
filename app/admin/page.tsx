"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  BarChart3,
  UserPlus,
  X,
  Loader2,
  Calendar,
  Crown,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Grid3x3,
  List,
  FileText,
  ChevronDown,
} from "lucide-react";
import GlobalLoading from "@/components/global-loading";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

// Import these from your feedback page or create a shared constants file
const FIRST_IMPRESSION_OPTIONS = [
  { value: "learning", label: "Learning about Asian countries and cultures" },
  { value: "planning", label: "Planning a trip to Asia" },
  { value: "games", label: "Playing travel-themed games" },
  { value: "not-sure", label: "I'm not really sure" },
  { value: "other", label: "Other" },
];

const ISSUE_OPTIONS = [
  { value: "none", label: "Nope, everything worked great! ✨" },
  { value: "slow", label: "Some things were a bit slow" },
  { value: "loading", label: "Something didn't load properly" },
  { value: "sound", label: "The sound/music didn't work" },
  { value: "button", label: "A button or link didn't work" },
  { value: "other", label: "Other" },
];

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

interface AdminUser {
  _id: string;
  displayName: string;
  email: string;
  role: "user" | "admin" | "owner";
  adminExpiresAt?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
}

interface FeedbackSummary {
  total: number;
  avgEaseOfUse: number;
  avgRecommendation: number;
  issues: { _id: string; count: number }[];
  firstImpression: { _id: string; count: number }[];
  referral: { _id: string; count: number }[];
  easeOfUse: { _id: number; count: number }[];
  recommendation: { _id: number; count: number }[];
}

interface FeedbackResponse {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
  firstImpression: string;
  firstImpressionOther?: string;
  easeOfUse: number;
  issues: string[];
  issuesOther?: string;
  recommendation: number;
  additionalFeedback?: string;
  referral: string;
  createdAt: string;
}

interface Candidate {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  reason: string;
  suggestedBy: { displayName: string; email: string };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

type FeedbackViewMode = "summary" | "byQuestion" | "byResponse";
type UserSortBy = "name" | "email" | "role" | "date";
type UserFilterRole = "all" | "owner" | "admin" | "user";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"feedback" | "users" | "candidates">("feedback");

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Feedback view states
  const [feedbackViewMode, setFeedbackViewMode] = useState<FeedbackViewMode>("summary");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("all");

  // User filter states  
  const [userSearch, setUserSearch] = useState("");
  const [userSortBy, setUserSortBy] = useState<UserSortBy>("name");
  const [userFilterRole, setUserFilterRole] = useState<UserFilterRole>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Suggest candidate form
  const [suggestName, setSuggestName] = useState("");
  const [suggestEmail, setSuggestEmail] = useState("");
  const [suggestReason, setSuggestReason] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.role !== "admin" && user.role !== "owner") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    if ((user.role === "owner" || user.role === "admin") && activeTab === "users") {
      fetchUsers();
    }
    if (user.role === "owner" && activeTab === "candidates") {
      fetchCandidates();
    }
    if (activeTab === "feedback") {
      fetchSummary();
      if (feedbackViewMode === "byResponse") {
        fetchResponses();
      }
    }
  }, [activeTab, user, feedbackViewMode]);

  const fetchUsers = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchSummary = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/summary`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchResponses = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/all`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setResponses(data.feedbacks);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCandidates = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setCandidates(data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string, expiresIn?: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, expiresIn }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleSuggestCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          candidateName: suggestName,
          candidateEmail: suggestEmail,
          reason: suggestReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuggestName("");
        setSuggestEmail("");
        setSuggestReason("");
        alert("Candidate suggested successfully!");
      }
    } catch (error) {
      console.error("Error suggesting candidate:", error);
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search
    if (userSearch) {
      filtered = filtered.filter(
        (u) =>
          u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    }

    // Apply role filter
    if (userFilterRole !== "all") {
      filtered = filtered.filter((u) => u.role === userFilterRole);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (userSortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "email":
          return a.email.localeCompare(b.email);
        case "role":
          const roleOrder = { owner: 0, admin: 1, user: 2 };
          return roleOrder[a.role] - roleOrder[b.role];
        case "date":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, userSearch, userSortBy, userFilterRole]);

  // Filter responses for search
  const filteredResponses = useMemo(() => {
    if (!feedbackSearch) return responses;
    
    return responses.filter(
      (r) =>
        r.userId.displayName.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        r.userId.email.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        r.additionalFeedback?.toLowerCase().includes(feedbackSearch.toLowerCase())
    );
  }, [responses, feedbackSearch]);

  if (authLoading || !user) return <GlobalLoading isLoading={true} />;

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalOwners = users.filter((u) => u.role === "owner").length;

  // Helper functions for mapping values to labels
  const getFirstImpressionLabel = (value: string) =>
    FIRST_IMPRESSION_OPTIONS.find((o) => o.value === value)?.label || value;

  const getIssueLabel = (value: string) =>
    ISSUE_OPTIONS.find((o) => o.value === value)?.label || value;

  const getEaseEmoji = (value: number) =>
    EASE_EMOJIS.find((e) => e.value === value);

  const getRecommendEmoji = (value: number) =>
    RECOMMEND_EMOJIS.find((e) => e.value === value);

  const renderFeedbackContent = () => {
    if (isLoadingData && !summary) {
      return (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (!summary || summary.total === 0) {
      return (
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg font-semibold mb-2">No feedback yet</p>
          <p className="text-sm text-gray-500">
            Responses will appear here once users submit the feedback form.
          </p>
        </div>
      );
    }

    switch (feedbackViewMode) {
      case "summary":
        return renderSummaryView();
      case "byQuestion":
        return renderByQuestionView();
      case "byResponse":
        return renderByResponseView();
      default:
        return null;
    }
  };

  const renderSummaryView = () => {
    if (!summary) return null;

    return (
      <>
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Total Responses
            </p>
            <p className="text-3xl font-bold">{summary.total}</p>
            <p className="text-xs text-gray-500 mt-2">
              Beta testers who shared feedback
            </p>
          </div>

          <div className="glass-strong rounded-2xl p-6">
            <div className="text-4xl mb-3">📱</div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Ease of Use Score
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-secondary">
                {summary.avgEaseOfUse.toFixed(1)}
              </p>
              <span className="text-xl">
                {getEaseEmoji(Math.round(summary.avgEaseOfUse))?.emoji}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getEaseEmoji(Math.round(summary.avgEaseOfUse))?.label}
            </p>
          </div>

          <div className="glass-strong rounded-2xl p-6">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Would Recommend
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-accent">
                {summary.avgRecommendation.toFixed(1)}
              </p>
              <span className="text-xl">
                {getRecommendEmoji(Math.round(summary.avgRecommendation))?.emoji}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getRecommendEmoji(Math.round(summary.avgRecommendation))?.label}
            </p>
          </div>
        </motion.div>

        {/* All Questions Overview */}
        <div className="space-y-8">
          {/* Q1: First Impressions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">👀</span>
              <div>
                <h3 className="text-lg font-bold">
                  Question 1: First Impressions
                </h3>
                <p className="text-xs text-gray-500">
                  What users think the app is for • {summary.total} responses
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {FIRST_IMPRESSION_OPTIONS.map((option) => {
                const item = summary.firstImpression.find(
                  (i) => i._id === option.value
                );
                const count = item?.count || 0;
                const pct = summary.total > 0 ? ((count / summary.total) * 100).toFixed(1) : "0";
                
                return (
                  <div key={option.value} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{option.label}</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-400">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Q2: Ease of Use */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="text-lg font-bold">
                    Question 2: How Easy Was It?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Ease of use rating distribution
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {EASE_EMOJIS.map((emoji) => {
                  const count =
                    summary.easeOfUse.find((i) => i._id === emoji.value)?.count || 0;
                  const percentage =
                    summary.total > 0 ? (count / summary.total) * 100 : 0;
                  
                  return (
                    <div
                      key={emoji.value}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-secondary/60 rounded-t-lg"
                          initial={{ height: 0 }}
                          animate={{ height: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xl">{emoji.emoji}</div>
                        <span className="text-[10px] text-gray-500">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Q4: Would Recommend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="text-lg font-bold">
                    Question 4: Would You Share It?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Recommendation likelihood
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {RECOMMEND_EMOJIS.map((emoji) => {
                  const count =
                    summary.recommendation.find((i) => i._id === emoji.value)?.count ||
                    0;
                  const percentage =
                    summary.total > 0 ? (count / summary.total) * 100 : 0;
                  
                  return (
                    <div
                      key={emoji.value}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent to-accent/60 rounded-t-lg"
                          initial={{ height: 0 }}
                          animate={{ height: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xl">{emoji.emoji}</div>
                        <span className="text-[10px] text-gray-500">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Q3: Issues */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🔧</span>
                <div>
                  <h3 className="text-lg font-bold">
                    Question 3: Did Anything Break?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Reported issues • Users could select multiple
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {ISSUE_OPTIONS.map((option) => {
                  const item = summary.issues.find(
                    (i) => i._id === option.value
                  );
                  const count = item?.count || 0;
                  
                  if (count === 0) return null;
                  
                  return (
                    <div
                      key={option.value}
                      className="flex justify-between items-center p-3 glass rounded-xl"
                    >
                      <span className="text-sm flex items-center gap-2">
                        {option.value === "none" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        {option.label}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Q6: Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="text-lg font-bold">
                    Question 6: Who Referred Users?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Referral sources
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {summary.referral.map((item) => {
                  const pct =
                    summary.total > 0
                      ? ((item.count / summary.total) * 100).toFixed(1)
                      : "0";
                  
                  return (
                    <div key={item._id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item._id}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  };

  const renderByQuestionView = () => {
    if (!summary) return null;

    const questions = [
      { id: "q1", emoji: "👀", title: "First Impressions", key: "firstImpression" },
      { id: "q2", emoji: "📱", title: "How Easy Was It?", key: "easeOfUse" },
      { id: "q3", emoji: "🔧", title: "Did Anything Break?", key: "issues" },
      { id: "q4", emoji: "💬", title: "Would You Share It?", key: "recommendation" },
      { id: "q6", emoji: "👥", title: "Who Referred You?", key: "referral" },
    ];

    const selectedQ = questions.find(q => q.id === selectedQuestion) || questions[0];

    return (
      <div className="space-y-6">
        {/* Question Selector */}
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedQuestion("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                selectedQuestion === "all"
                  ? "bg-primary text-white"
                  : "glass hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              All Questions
            </button>
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                  selectedQuestion === q.id
                    ? "bg-primary text-white"
                    : "glass hover:bg-white/50 dark:hover:bg-white/10"
                }`}
              >
                <span>{q.emoji}</span>
                {q.title}
              </button>
            ))}
          </div>
        </div>

        {/* Display selected question or all */}
        {selectedQuestion === "all" ? (
          renderSummaryView()
        ) : (
          <motion.div
            key={selectedQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{selectedQ.emoji}</span>
              <div>
                <h3 className="text-xl font-bold">{selectedQ.title}</h3>
                <p className="text-sm text-gray-500">
                  Detailed breakdown • {summary.total} responses
                </p>
              </div>
            </div>

            {/* Render question-specific content */}
            {selectedQ.key === "firstImpression" && (
              <div className="space-y-4">
                {FIRST_IMPRESSION_OPTIONS.map((option) => {
                  const item = summary.firstImpression.find(
                    (i) => i._id === option.value
                  );
                  const count = item?.count || 0;
                  const pct = summary.total > 0 ? ((count / summary.total) * 100).toFixed(1) : "0";
                  
                  return (
                    <div key={option.value} className="glass rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-2xl font-bold text-primary">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {count} {count === 1 ? 'response' : 'responses'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Similar detailed views for other questions... */}
          </motion.div>
        )}
      </div>
    );
  };

  const renderByResponseView = () => {
    return (
      <div className="space-y-4">
        {filteredResponses.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <p className="text-gray-500">No responses found</p>
          </div>
        ) : (
          filteredResponses.map((response) => (
            <motion.div
              key={response._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-6"
            >
              {/* User Info Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold">
                    {response.userId.avatar ? (
                      <img
                        src={response.userId.avatar}
                        alt={response.userId.displayName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      response.userId.displayName?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{response.userId.displayName}</p>
                    <p className="text-xs text-gray-500">{response.userId.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(response.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Response Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">First Impression</p>
                    <p className="font-medium">{getFirstImpressionLabel(response.firstImpression)}</p>
                    {response.firstImpressionOther && (
                      <p className="text-xs text-gray-400 mt-1">{response.firstImpressionOther}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ease of Use</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {getEaseEmoji(response.easeOfUse)?.emoji}
                      </span>
                      <span className="font-medium">
                        {getEaseEmoji(response.easeOfUse)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Would Recommend</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {getRecommendEmoji(response.recommendation)?.emoji}
                      </span>
                      <span className="font-medium">
                        {getRecommendEmoji(response.recommendation)?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issues Reported</p>
                    <div className="space-y-1">
                      {response.issues.map((issue) => (
                        <div key={issue} className="flex items-center gap-2">
                          {issue === "none" ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-yellow-500" />
                          )}
                          <span className="text-xs">{getIssueLabel(issue)}</span>
                        </div>
                      ))}
                      {response.issuesOther && (
                        <p className="text-xs text-gray-400 mt-1">{response.issuesOther}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Referred by</p>
                    <p className="font-medium">{response.referral}</p>
                  </div>
                </div>
              </div>

              {response.additionalFeedback && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 mb-2">Additional Feedback</p>
                  <p className="text-sm italic">"{response.additionalFeedback}"</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Console
            </h1>
            <p className="text-neutral-dark dark:text-gray-400 mt-2 text-sm">
              Logged in as {user.displayName} ({user.role})
            </p>
          </div>
          <div className="text-6xl">🐱</div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-1 border-b border-white/10">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 rounded-t-xl font-medium text-sm flex items-center gap-2 border-b-2 ${
              activeTab === "feedback"
                ? "border-primary text-primary bg-white/70 dark:bg-white/5"
                : "border-transparent text-gray-500 hover:text-primary"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Feedback Responses
          </button>

          {(user.role === "owner" || user.role === "admin") && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-t-xl font-medium text-sm flex items-center gap-2 border-b-2 ${
                activeTab === "users"
                  ? "border-primary text-primary bg-white/70 dark:bg-white/5"
                  : "border-transparent text-gray-500 hover:text-primary"
              }`}
            >
              <Users className="w-4 h-4" />
              Users & Admins
            </button>
          )}

          {user.role === "owner" && (
            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-4 py-2 rounded-t-xl font-medium text-sm flex items-center gap-2 border-b-2 ${
                activeTab === "candidates"
                  ? "border-primary text-primary bg-white/70 dark:bg-white/5"
                  : "border-transparent text-gray-500 hover:text-primary"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Admin Candidates
            </button>
          )}
        </div>

        {/* FEEDBACK TAB */}
        {activeTab === "feedback" && (
          <div className="space-y-6">
            {/* Filters and View Mode */}
            <div className="glass-strong rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search feedback..."
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl glass border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* View Mode Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedbackViewMode("summary")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      feedbackViewMode === "summary"
                        ? "bg-primary text-white"
                        : "glass hover:bg-white/50 dark:hover:bg-white/10"
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    Summary
                  </button>
                  <button
                    onClick={() => setFeedbackViewMode("byQuestion")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      feedbackViewMode === "byQuestion"
                        ? "bg-primary text-white"
                        : "glass hover:bg-white/50 dark:hover:bg-white/10"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    By Question
                  </button>
                  <button
                    onClick={() => setFeedbackViewMode("byResponse")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      feedbackViewMode === "byResponse"
                        ? "bg-primary text-white"
                        : "glass hover:bg-white/50 dark:hover:bg-white/10"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    By Response
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback Content */}
            {renderFeedbackContent()}

            {/* Suggest Admin Form (only in summary view) */}
            {feedbackViewMode === "summary" && summary && summary.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-strong rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="text-lg font-bold">
                      Suggest an Admin Candidate
                    </h3>
                    <p className="text-xs text-gray-500">
                      Nominate someone to help manage the platform
                    </p>
                  </div>
                </div>
                <form onSubmit={handleSuggestCandidate} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Candidate name"
                    value={suggestName}
                    onChange={(e) => setSuggestName(e.target.value)}
                    className="w-full p-3 rounded-xl glass border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Candidate email"
                    value={suggestEmail}
                    onChange={(e) => setSuggestEmail(e.target.value)}
                    className="w-full p-3 rounded-xl glass border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <textarea
                    placeholder="Why should this person be an admin?"
                    value={suggestReason}
                    onChange={(e) => setSuggestReason(e.target.value)}
                    className="w-full p-3 rounded-xl glass border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl text-sm font-semibold"
                  >
                    Submit Nomination
                  </motion.button>
                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="glass-strong rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl glass border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-white/10 text-sm font-medium flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <select
                    value={userSortBy}
                    onChange={(e) => setUserSortBy(e.target.value as UserSortBy)}
                    className="px-4 py-2 rounded-xl glass border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="role">Sort by Role</option>
                    <option value="date">Sort by Date</option>
                  </select>
                </div>
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUserFilterRole("all")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            userFilterRole === "all"
                              ? "bg-primary text-white"
                              : "glass hover:bg-white/50 dark:hover:bg-white/10"
                          }`}
                        >
                          All Roles
                        </button>
                        <button
                          onClick={() => setUserFilterRole("owner")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            userFilterRole === "owner"
                              ? "bg-primary text-white"
                              : "glass hover:bg-white/50 dark:hover:bg-white/10"
                          }`}
                        >
                          Owners
                        </button>
                        <button
                          onClick={() => setUserFilterRole("admin")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            userFilterRole === "admin"
                              ? "bg-primary text-white"
                              : "glass hover:bg-white/50 dark:hover:bg-white/10"
                          }`}
                        >
                          Admins
                        </button>
                        <button
                          onClick={() => setUserFilterRole("user")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            userFilterRole === "user"
                              ? "bg-primary text-white"
                              : "glass hover:bg-white/50 dark:hover:bg-white/10"
                          }`}
                        >
                          Users
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin/Owner Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Owners</p>
                    <p className="text-2xl font-bold">{totalOwners}</p>
                  </div>
                </div>
              </div>
              <div className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Admins</p>
                    <p className="text-2xl font-bold">{totalAdmins}</p>
                  </div>
                </div>
              </div>
              <div className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Showing</p>
                    <p className="text-2xl font-bold">{filteredUsers.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {isLoadingData && users.length === 0 ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="glass-strong rounded-2xl p-6 text-center text-sm text-gray-500">
                No users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto glass-strong rounded-2xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Admin Expires</th>
                      {user.role === "owner" && <th className="p-4">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="border-b border-white/5 hover:bg-white/5 text-sm"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.displayName}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                u.displayName?.[0]?.toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">{u.displayName}</div>
                              <div className="text-xs opacity-60">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                              u.role === "owner"
                                ? "bg-purple-500/15 text-purple-400"
                                : u.role === "admin"
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-gray-500/15 text-gray-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-xs opacity-60">
                          {u.adminExpiresAt
                            ? new Date(u.adminExpiresAt).toLocaleDateString()
                            : u.role === "admin"
                            ? "Permanent"
                            : "-"}
                        </td>
                        {user.role === "owner" && (
                          <td className="p-4">
                            {u.role !== "owner" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateRole(u._id, "admin", 30)}
                                  className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                  title="Make admin for 30 days"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(u._id, "admin")}
                                  className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                  title="Make permanent admin"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                                {u.role === "admin" && (
                                  <button
                                    onClick={() => handleUpdateRole(u._id, "user")}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    title="Revoke admin"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Owner</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CANDIDATES TAB (owner only) */}
        {activeTab === "candidates" && user.role === "owner" && (
          <div className="space-y-4">
            {isLoadingData && candidates.length === 0 ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="glass-strong rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-semibold mb-2">No pending candidates</p>
                <p className="text-sm text-gray-500">
                  Admin nominations will appear here for your review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map((candidate) => (
                  <motion.div
                    key={candidate._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-2xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {candidate.candidateName}
                        </h3>
                        <p className="text-xs opacity-60">
                          {candidate.candidateEmail}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/20 text-yellow-500 uppercase">
                        {candidate.status}
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl mb-4">
                      <p className="text-sm italic">"{candidate.reason}"</p>
                      <p className="text-[11px] opacity-60 mt-2 text-right">
                        Suggested by {candidate.suggestedBy?.displayName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-500/20 text-green-500 py-2 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition-colors">
                        Approve
                      </button>
                      <button className="flex-1 bg-red-500/20 text-red-500 py-2 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-colors">
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}