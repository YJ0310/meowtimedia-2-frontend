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
  AlertCircle,
  Search,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Infinity,
  PieChart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
} from "lucide-react";
import GlobalLoading from "@/components/global-loading";
import { ToastContainer, useToast } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

// --- Constants (Same as before) ---
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

const DURATION_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "End of This Year", days: null, isEndOfYear: true },
  { label: "1 Year", days: 365 },
];

// --- Interfaces ---
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

type TabType = "feedback" | "users" | "manageAdmins";
type FeedbackSubTab = "summary" | "question" | "individual";
type ModalType = "add" | "propose" | "approve" | "editExpiry" | null;

// --- Helper Functions ---
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error, warning, info } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("feedback");
  const [feedbackSubTab, setFeedbackSubTab] = useState<FeedbackSubTab>("summary");

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Feedback view states
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);

  // User management states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "user" | "admin" | "owner">("all");

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalEmail, setModalEmail] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalReason, setModalReason] = useState("");
  const [modalPermanent, setModalPermanent] = useState(false);
  const [modalExpiry, setModalExpiry] = useState("");
  const [modalSearchResults, setModalSearchResults] = useState<AdminUser[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Define questions for "By Question" view
  const QUESTIONS = [
    { id: "firstImpression", label: "1. First Impressions" },
    { id: "easeOfUse", label: "2. How Easy Was It?" },
    { id: "issues", label: "3. Did Anything Break?" },
    { id: "recommendation", label: "4. Would You Share It?" },
    { id: "additionalFeedback", label: "5. Other Thoughts" },
    { id: "referral", label: "6. Who Referred You?" },
  ];

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading && !user) {
      warning("Authentication Required", "Please log in to access the admin console");
      router.push("/login");
    } else if (user && user.role !== "admin" && user.role !== "owner") {
      error("Access Denied", "You don't have permission to access this page");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!user) return;

    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "manageAdmins") {
      fetchUsers();
      if (user.role === "owner") {
        fetchCandidates();
      }
    } else if (activeTab === "feedback") {
      fetchSummary();
      fetchResponses();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      error("Error", "Failed to fetch users");
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feedback/summary`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setSummary(data.summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const fetchResponses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feedback/all`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setResponses(data.feedbacks);
    } catch (err) {
      console.error("Error fetching responses:", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setCandidates(data.candidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // ... (Keep existing handleUpdateRole, handleSuggestCandidate, etc. - omitted for brevity but assume they exist as in previous code)
  
  // -- Placeholders for logic functions (Add these back from your original code) --
  const handleUpdateRole = async (userId: string, role: string, expiresIn?: number) => { /* ... */ };
  const handleSuggestCandidate = async () => { /* ... */ };
  const handleAddAdmin = async () => { /* ... */ };
  const handleApproveCandidate = async () => { /* ... */ };
  const handleEditExpiry = async () => { /* ... */ };
  const handleRejectCandidate = async (candidateId: string) => { /* ... */ };
  
  // -- Modal logic --
  const openApproveModal = (candidate: Candidate) => { /* ... */ setModalType("approve"); }; // Simplified for brevity
  const openEditExpiryModal = (admin: AdminUser) => { /* ... */ setModalType("editExpiry"); };
  const resetModal = () => { setModalType(null); /* ... */ };
  const handleEmailSearch = (email: string) => { /* ... */ };
  const selectUserFromSearch = (u: AdminUser) => { /* ... */ };
  const applyDurationPreset = (p: any) => { /* ... */ };


  // Filter logic
  const filteredUsers = useMemo(() => {
    // ... (Keep existing filter logic)
    return users; // Placeholder return
  }, [users, userSearch, userRoleFilter]);

  const adminsList = useMemo(() => users.filter((u) => u.role === "admin" || u.role === "owner"), [users]);

  // --- Helper Data Accessors for "By Question" ---
  
  const getQuestionData = (questionId: string) => {
    if (!responses.length) return [];

    switch (questionId) {
      case "firstImpression":
        return responses.map(r => ({
          userId: r.userId,
          value: FIRST_IMPRESSION_OPTIONS.find(o => o.value === r.firstImpression)?.label || r.firstImpression,
          detail: r.firstImpression === "other" ? r.firstImpressionOther : null,
          date: r.createdAt
        }));
      case "easeOfUse":
        return responses.map(r => {
            const emoji = EASE_EMOJIS.find(e => e.value === r.easeOfUse);
            return {
                userId: r.userId,
                value: `${emoji?.emoji} ${emoji?.label} (${r.easeOfUse}/5)`,
                date: r.createdAt
            };
        });
      case "issues":
        // Flatten issues
        let allIssues: any[] = [];
        responses.forEach(r => {
            r.issues.forEach(issue => {
                allIssues.push({
                    userId: r.userId,
                    value: ISSUE_OPTIONS.find(o => o.value === issue)?.label || issue,
                    detail: issue === "other" ? r.issuesOther : null,
                    date: r.createdAt
                });
            });
        });
        return allIssues;
      case "recommendation":
        return responses.map(r => {
            const emoji = RECOMMEND_EMOJIS.find(e => e.value === r.recommendation);
            return {
                userId: r.userId,
                value: `${emoji?.emoji} ${emoji?.label} (${r.recommendation}/5)`,
                date: r.createdAt
            };
        });
      case "additionalFeedback":
        return responses
            .filter(r => r.additionalFeedback)
            .map(r => ({
                userId: r.userId,
                value: r.additionalFeedback,
                date: r.createdAt
            }));
      case "referral":
        return responses.map(r => ({
            userId: r.userId,
            value: r.referral,
            date: r.createdAt
        }));
      default:
        return [];
    }
  };

  const getFirstImpressionLabel = (value: string) =>
    FIRST_IMPRESSION_OPTIONS.find((o) => o.value === value)?.label || value;

  const getIssueLabel = (value: string) =>
    ISSUE_OPTIONS.find((o) => o.value === value)?.label || value;

  const getEaseEmoji = (value: number) =>
    EASE_EMOJIS.find((e) => e.value === value);

  const getRecommendEmoji = (value: number) =>
    RECOMMEND_EMOJIS.find((e) => e.value === value);

  // --- Render Functions ---

  const renderPieChart = (data: { _id: string; count: number }[], total: number, getLabel: (val: string) => string) => {
     // ... (Keep existing implementation)
     return <div />; // Placeholder
  };

  const renderBarChart = (data: { _id: number; count: number }[], total: number, getEmoji: (val: number) => any) => {
    // ... (Keep existing implementation)
    return <div />; // Placeholder
  };

  if (authLoading || !user) return <GlobalLoading isLoading={true} />;
  const isOwner = user.role === "owner";

  // Current Individual Response
  const currentResponse = responses[selectedResponseIndex];

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 pt-24">
      <ToastContainer toasts={toasts} onRemove={removeToast} hasNavbar />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Console
            </h1>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === "feedback"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Feedback Responses
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Users className="w-5 h-5" />
            Users & Admins
          </button>

          <button
            onClick={() => setActiveTab("manageAdmins")}
            className={`px-4 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === "manageAdmins"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Crown className="w-5 h-5" />
            Manage Admins
          </button>
        </div>

        {/* --- FEEDBACK TAB CONTENT --- */}
        <AnimatePresence mode="wait">
          {activeTab === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Feedback Sub-Navigation (Google Forms Style) */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 dark:bg-black/20 p-1 rounded-xl inline-flex">
                    <button
                        onClick={() => setFeedbackSubTab('summary')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                            feedbackSubTab === 'summary' 
                            ? 'bg-white shadow-sm text-black dark:bg-gray-700 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Summary
                    </button>
                    <button
                        onClick={() => setFeedbackSubTab('question')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                            feedbackSubTab === 'question' 
                            ? 'bg-white shadow-sm text-black dark:bg-gray-700 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        By Question
                    </button>
                    <button
                        onClick={() => setFeedbackSubTab('individual')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                            feedbackSubTab === 'individual' 
                            ? 'bg-white shadow-sm text-black dark:bg-gray-700 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Individual
                    </button>
                </div>
              </div>

              {/* 1. SUMMARY VIEW */}
              {feedbackSubTab === 'summary' && summary && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-strong rounded-2xl p-6 text-center">
                            <h3 className="text-lg font-semibold mb-2 text-gray-500">Total Responses</h3>
                            <p className="text-5xl font-bold text-primary">{summary.total}</p>
                        </div>
                        <div className="glass-strong rounded-2xl p-6 text-center">
                            <h3 className="text-lg font-semibold mb-2 text-gray-500">Avg Ease of Use</h3>
                            <p className="text-5xl font-bold text-secondary">{summary.avgEaseOfUse.toFixed(1)}</p>
                            <div className="text-xs text-gray-400 mt-2">out of 5</div>
                        </div>
                        <div className="glass-strong rounded-2xl p-6 text-center">
                            <h3 className="text-lg font-semibold mb-2 text-gray-500">Avg Recommendation</h3>
                            <p className="text-5xl font-bold text-accent">{summary.avgRecommendation.toFixed(1)}</p>
                            <div className="text-xs text-gray-400 mt-2">out of 5</div>
                        </div>
                    </div>

                    {/* Chart Sections (Simplified wrapper for existing logic) */}
                    <div className="glass-strong rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-6">1. First Impressions</h3>
                        {/* Call your renderPieChart function here with summary.firstImpression */}
                        {/* Placeholder visual for demonstration */}
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                            <div className="bg-primary h-full w-[60%]"></div>
                            <div className="bg-secondary h-full w-[25%]"></div>
                            <div className="bg-accent h-full w-[15%]"></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-center">Check specific answers in 'By Question' tab</p>
                    </div>

                    <div className="glass-strong rounded-2xl p-6">
                         <h3 className="text-lg font-bold mb-6">2. Issues Reported</h3>
                         {/* Call renderPieChart here with summary.issues */}
                         <div className="space-y-2">
                             {summary.issues.map(i => (
                                 <div key={i._id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                     <span>{getIssueLabel(i._id)}</span>
                                     <span className="font-bold">{i.count}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
              )}

              {/* 2. BY QUESTION VIEW */}
              {feedbackSubTab === 'question' && (
                <div className="space-y-6">
                    {/* Question Selector */}
                    <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
                        <button 
                            onClick={() => setSelectedQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={selectedQuestionIndex === 0}
                            className="p-2 hover:bg-black/10 rounded-full disabled:opacity-30"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        
                        <div className="text-center">
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Question {selectedQuestionIndex + 1} of {QUESTIONS.length}</h3>
                            <h2 className="text-xl font-bold">{QUESTIONS[selectedQuestionIndex].label}</h2>
                        </div>

                        <button 
                            onClick={() => setSelectedQuestionIndex(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
                            disabled={selectedQuestionIndex === QUESTIONS.length - 1}
                            className="p-2 hover:bg-black/10 rounded-full disabled:opacity-30"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Answers List */}
                    <div className="glass-strong rounded-2xl overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/10 font-semibold flex justify-between items-center">
                            <span>{getQuestionData(QUESTIONS[selectedQuestionIndex].id).length} Responses</span>
                        </div>
                        
                        <div className="divide-y divide-white/10">
                            {getQuestionData(QUESTIONS[selectedQuestionIndex].id).length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No responses for this question yet.</div>
                            ) : (
                                getQuestionData(QUESTIONS[selectedQuestionIndex].id).map((item, idx) => (
                                    <div key={idx} className="p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-start gap-4">
                                            {item.userId.avatar ? (
                                                <img src={item.userId.avatar} alt="" className="w-10 h-10 rounded-full mt-1" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mt-1">
                                                    <span className="font-bold text-lg">{item.userId.displayName[0]}</span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold">{item.userId.displayName}</span>
                                                    <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                                                </div>
                                                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg text-sm">
                                                    {item.value || <span className="text-gray-400 italic">No answer</span>}
                                                </div>
                                                {item.detail && (
                                                    <div className="mt-2 text-xs text-gray-500 pl-2 border-l-2 border-primary">
                                                        Note: {item.detail}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
              )}

              {/* 3. INDIVIDUAL VIEW */}
              {feedbackSubTab === 'individual' && (
                <div className="space-y-6">
                    {responses.length === 0 ? (
                        <div className="glass-strong rounded-2xl p-8 text-center">No responses yet.</div>
                    ) : (
                        <>
                            {/* Response Paginator */}
                            <div className="glass-strong rounded-2xl p-3 flex items-center justify-between sticky top-4 z-10 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedResponseIndex(prev => Math.max(0, prev - 1))}
                                        disabled={selectedResponseIndex === 0}
                                        className="p-2 hover:bg-black/10 rounded-full disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="font-mono font-bold">
                                        {selectedResponseIndex + 1} / {responses.length}
                                    </span>
                                    <button 
                                        onClick={() => setSelectedResponseIndex(prev => Math.min(responses.length - 1, prev + 1))}
                                        disabled={selectedResponseIndex === responses.length - 1}
                                        className="p-2 hover:bg-black/10 rounded-full disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Submitted: {formatDateTime(currentResponse.createdAt)}
                                </div>
                            </div>

                            {/* User Details Card */}
                            <div className="glass-strong rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                                    {currentResponse.userId.avatar ? (
                                        <img src={currentResponse.userId.avatar} alt="" className="w-16 h-16 rounded-full" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                                            {currentResponse.userId.displayName[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold">{currentResponse.userId.displayName}</h2>
                                        <p className="text-gray-500">{currentResponse.userId.email}</p>
                                    </div>
                                </div>

                                {/* Form Reproduction */}
                                <div className="space-y-8">
                                    {/* Q1 */}
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold">First Impression</div>
                                        <div className="text-lg font-medium">{getFirstImpressionLabel(currentResponse.firstImpression)}</div>
                                        {currentResponse.firstImpression === 'other' && (
                                            <div className="mt-2 p-2 bg-black/20 rounded text-sm">{currentResponse.firstImpressionOther}</div>
                                        )}
                                    </div>

                                    {/* Q2 */}
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold">Ease of Use</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{getEaseEmoji(currentResponse.easeOfUse)?.emoji}</span>
                                            <span className="text-xl">{getEaseEmoji(currentResponse.easeOfUse)?.label}</span>
                                        </div>
                                    </div>

                                    {/* Q3 */}
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold">Issues Reported</div>
                                        <div className="flex flex-wrap gap-2">
                                            {currentResponse.issues.map(issue => (
                                                <span key={issue} className={`px-3 py-1 rounded-full text-sm font-medium border ${issue === 'none' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                                                    {getIssueLabel(issue)}
                                                </span>
                                            ))}
                                        </div>
                                        {currentResponse.issues.includes('other') && (
                                            <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-400">
                                                Detail: {currentResponse.issuesOther}
                                            </div>
                                        )}
                                    </div>

                                    {/* Q4 */}
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold">Recommendation Likelihood</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{getRecommendEmoji(currentResponse.recommendation)?.emoji}</span>
                                            <span className="text-xl">{getRecommendEmoji(currentResponse.recommendation)?.label}</span>
                                        </div>
                                    </div>

                                    {/* Q5 */}
                                    {currentResponse.additionalFeedback && (
                                        <div className="bg-white/5 p-4 rounded-xl">
                                            <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold">Additional Feedback</div>
                                            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl italic">
                                                "{currentResponse.additionalFeedback}"
                                            </div>
                                        </div>
                                    )}

                                    {/* Q6 */}
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold">Referral Source</div>
                                        <div className="font-semibold text-lg flex items-center gap-2">
                                            <UserCheck className="w-5 h-5 text-primary" />
                                            {currentResponse.referral}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
              )}
            </motion.div>
          )}
          
          {/* ... (Keep Users and ManageAdmins tabs exactly as they were) ... */}
           {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
                {/* Re-paste your Users tab content here */}
                <div className="glass-strong rounded-2xl p-8 text-center">User Management Content (Existing)</div>
            </motion.div>
           )}

           {activeTab === "manageAdmins" && (
            <motion.div
              key="manageAdmins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
                {/* Re-paste your Manage Admins tab content here */}
                <div className="glass-strong rounded-2xl p-8 text-center">Admin Management Content (Existing)</div>
            </motion.div>
           )}
        </AnimatePresence>

        {/* ... (Keep Modal logic exactly as it was) ... */}

      </div>
    </div>
  );
}