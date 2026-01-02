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
  Mail,
  UserCheck,
  UserX,
  Clock,
  Infinity,
  PieChart,
} from "lucide-react";
import GlobalLoading from "@/components/global-loading";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

// Form constants matching the feedback form
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

const REFERRAL_OPTIONS = [
  "Sek Yin Jia",
  "Foo Jia Qian",
  "Cheah Chio Yuen",
  "Errol Tay Lee Han",
  "Lee Chang Xin",
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

type TabType = "feedback" | "users" | "manageAdmins";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("feedback");

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Feedback view states
  const [feedbackSearch, setFeedbackSearch] = useState("");

  // User management states  
  const [userSearch, setUserSearch] = useState("");

  // Add/Propose Admin form states
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormEmail, setAdminFormEmail] = useState("");
  const [adminFormName, setAdminFormName] = useState("");
  const [adminFormReason, setAdminFormReason] = useState("");
  const [adminFormPermanent, setAdminFormPermanent] = useState(false);
  const [adminFormExpiry, setAdminFormExpiry] = useState("");
  const [adminFormSearchResults, setAdminFormSearchResults] = useState<AdminUser[]>([]);

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.role !== "admin" && user.role !== "owner") {
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
    } catch (error) {
      console.error("Error fetching users:", error);
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
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchResponses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feedback/all`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setResponses(data.feedbacks);
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setCandidates(data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    role: string,
    expiresIn?: number
  ) => {
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
        alert("Role updated successfully!");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    }
  };

  const handleSuggestCandidate = async () => {
    if (!adminFormEmail || !adminFormName || !adminFormReason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          candidateName: adminFormName,
          candidateEmail: adminFormEmail,
          reason: adminFormReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        resetAdminForm();
        alert("Candidate suggested successfully!");
        fetchCandidates();
      }
    } catch (error) {
      console.error("Error suggesting candidate:", error);
      alert("Failed to suggest candidate");
    }
  };

  const handleAddAdmin = async () => {
    if (!adminFormEmail || !adminFormReason) {
      alert("Please fill in all required fields");
      return;
    }

    if (!adminFormPermanent && !adminFormExpiry) {
      alert("Please select an expiry date or mark as permanent");
      return;
    }

    try {
      // Find the user by email
      const targetUser = users.find((u) => u.email === adminFormEmail);
      if (!targetUser) {
        alert("User not found");
        return;
      }

      // Calculate expiresIn (days from now)
      let expiresIn: number | undefined = undefined;
      if (!adminFormPermanent && adminFormExpiry) {
        const expiryDate = new Date(adminFormExpiry);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        expiresIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      await handleUpdateRole(targetUser._id, "admin", expiresIn);
      resetAdminForm();
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Failed to add admin");
    }
  };

  const resetAdminForm = () => {
    setShowAdminForm(false);
    setAdminFormEmail("");
    setAdminFormName("");
    setAdminFormReason("");
    setAdminFormPermanent(false);
    setAdminFormExpiry("");
    setAdminFormSearchResults([]);
  };

  const handleEmailSearch = (email: string) => {
    setAdminFormEmail(email);
    if (email.length >= 2) {
      const results = users.filter(
        (u) =>
          u.email.toLowerCase().includes(email.toLowerCase()) ||
          u.displayName.toLowerCase().includes(email.toLowerCase())
      );
      setAdminFormSearchResults(results.slice(0, 5));
    } else {
      setAdminFormSearchResults([]);
    }
  };

  const selectUserFromSearch = (selectedUser: AdminUser) => {
    setAdminFormEmail(selectedUser.email);
    setAdminFormName(selectedUser.displayName);
    setAdminFormSearchResults([]);
  };

  // Filter users and admins
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users.filter((u) => u.role === "user");
    return users
      .filter((u) => u.role === "user")
      .filter(
        (u) =>
          u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase())
      );
  }, [users, userSearch]);

  const adminsList = useMemo(() => {
    return users.filter((u) => u.role === "admin" || u.role === "owner");
  }, [users]);

  const filteredResponses = useMemo(() => {
    if (!feedbackSearch) return responses;
    return responses.filter(
      (r) =>
        r.userId.displayName
          .toLowerCase()
          .includes(feedbackSearch.toLowerCase()) ||
        r.userId.email.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        r.additionalFeedback
          ?.toLowerCase()
          .includes(feedbackSearch.toLowerCase())
    );
  }, [responses, feedbackSearch]);

  // Helper functions
  const getFirstImpressionLabel = (value: string) =>
    FIRST_IMPRESSION_OPTIONS.find((o) => o.value === value)?.label || value;

  const getIssueLabel = (value: string) =>
    ISSUE_OPTIONS.find((o) => o.value === value)?.label || value;

  const getEaseEmoji = (value: number) =>
    EASE_EMOJIS.find((e) => e.value === value);

  const getRecommendEmoji = (value: number) =>
    RECOMMEND_EMOJIS.find((e) => e.value === value);

  // Render pie chart for categorical data
  const renderPieChart = (data: { _id: string; count: number }[], total: number, getLabel: (val: string) => string) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No responses yet</p>
        </div>
      );
    }

    // Calculate total for percentages
    const dataTotal = data.reduce((sum, item) => sum + item.count, 0);

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = dataTotal > 0 ? ((item.count / dataTotal) * 100).toFixed(1) : 0;
          const colors = [
            "bg-blue-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-red-500",
            "bg-indigo-500",
          ];
          const color = colors[index % colors.length];

          return (
            <div key={item._id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {getLabel(item._id)}
                </span>
                <span className="text-sm font-bold">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render bar chart for rating data
  const renderBarChart = (
    data: { _id: number; count: number }[],
    total: number,
    getEmoji: (val: number) => any
  ) => {
    const ratings = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-end justify-between h-48 gap-2">
        {ratings.map((rating) => {
          const item = data.find((d) => d._id === rating);
          const count = item?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const emoji = getEmoji(rating);

          return (
            <div key={rating} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-500 flex items-center justify-center"
                  style={{ height: `${percentage}%`, minHeight: count > 0 ? "30px" : "0" }}
                >
                  {count > 0 && (
                    <span className="text-white font-bold text-sm">{count}</span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{emoji?.emoji}</div>
                <div className="text-xs font-bold">{rating}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (authLoading || !user) return <GlobalLoading isLoading={true} />;

  const isOwner = user.role === "owner";

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Console
            </h1>
            <p className="text-neutral-dark dark:text-gray-400 mt-2">
              Welcome back, {user.displayName} ({user.role})
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "feedback"
                ? "bg-primary text-white shadow-lg"
                : "glass hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Feedback Responses
          </button>
          
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-primary text-white shadow-lg"
                : "glass hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            <Users className="w-5 h-5" />
            Users & Admins
          </button>

          <button
            onClick={() => setActiveTab("manageAdmins")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "manageAdmins"
                ? "bg-primary text-white shadow-lg"
                : "glass hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            <Crown className="w-5 h-5" />
            Manage Admins
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Search */}
              <div className="glass-strong rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedback by user name, email, or content..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              {/* Summary Statistics */}
              {summary && summary.total > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-strong rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">Total Responses</h3>
                      <p className="text-4xl font-bold text-primary">{summary.total}</p>
                    </div>
                    <div className="glass-strong rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">Avg Ease of Use</h3>
                      <p className="text-4xl font-bold text-secondary">
                        {summary.avgEaseOfUse.toFixed(1)}/5
                      </p>
                    </div>
                    <div className="glass-strong rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">Avg Recommendation</h3>
                      <p className="text-4xl font-bold text-accent">
                        {summary.avgRecommendation.toFixed(1)}/5
                      </p>
                    </div>
                  </div>

                  {/* Questions in correct order */}
                  <div className="space-y-6">
                    {/* 1. First Impressions */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        1. First Impressions
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        What brought you here today?
                      </p>
                      {renderPieChart(summary.firstImpression, summary.total, getFirstImpressionLabel)}
                    </div>

                    {/* 2. How Easy Was It? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4">
                        2. How Easy Was It? (1-5)
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Rate the ease of use
                      </p>
                      {renderBarChart(summary.easeOfUse, summary.total, getEaseEmoji)}
                    </div>

                    {/* 3. Did Anything Break? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        3. Did Anything Break?
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Reported issues and problems
                      </p>
                      {renderPieChart(summary.issues, summary.total, getIssueLabel)}
                    </div>

                    {/* 4. Would You Share It? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4">
                        4. Would You Share It? (1-5)
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Recommendation score
                      </p>
                      {renderBarChart(summary.recommendation, summary.total, getRecommendEmoji)}
                    </div>

                    {/* 5. Any Other Thoughts? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        5. Any Other Thoughts?
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {filteredResponses.filter(r => r.additionalFeedback && r.additionalFeedback.trim().length > 0).length} users shared additional feedback
                      </p>
                      <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
                        {filteredResponses
                          .filter(r => r.additionalFeedback && r.additionalFeedback.trim().length > 0)
                          .map((response) => (
                            <div key={response._id} className="bg-white/5 p-4 rounded-xl">
                              <div className="flex items-center gap-3 mb-2">
                                {response.userId.avatar && (
                                  <img
                                    src={response.userId.avatar}
                                    alt={response.userId.displayName}
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-sm">
                                    {response.userId.displayName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(response.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm italic">"{response.additionalFeedback}"</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 6. Who Referred You? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        6. Who Referred You?
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Referral sources
                      </p>
                      {renderPieChart(summary.referral, summary.total, (val) => val)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-strong rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-semibold mb-2">No feedback yet</p>
                  <p className="text-sm text-gray-500">
                    Responses will appear here once users submit the feedback form.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search */}
              <div className="glass-strong rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-strong rounded-xl p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
                <div className="glass-strong rounded-xl p-6 text-center">
                  <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{adminsList.length}</p>
                  <p className="text-sm text-gray-500">Admins & Owners</p>
                </div>
                <div className="glass-strong rounded-xl p-6 text-center">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{filteredUsers.length}</p>
                  <p className="text-sm text-gray-500">Regular Users</p>
                </div>
              </div>

              {/* Admin List */}
              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Admins & Owners</h3>
                <div className="space-y-3">
                  {adminsList.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {admin.avatar && (
                          <img
                            src={admin.avatar}
                            alt={admin.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{admin.displayName}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {admin.role === "owner" ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold flex items-center gap-1">
                            <Crown className="w-4 h-4" />
                            Owner
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Admin
                            {admin.adminExpiresAt && (
                              <span className="ml-1 text-xs">
                                (until {new Date(admin.adminExpiresAt).toLocaleDateString()})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User List */}
              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Regular Users</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {u.avatar && (
                          <img
                            src={u.avatar}
                            alt={u.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{u.displayName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No users found</p>
                  )}
                </div>
              </div>
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
              {/* Current Admins List */}
              <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Current Admins</h3>
                  {isOwner && (
                    <button
                      onClick={() => setShowAdminForm(true)}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Admin
                    </button>
                  )}
                  {!isOwner && (
                    <button
                      onClick={() => setShowAdminForm(true)}
                      className="px-4 py-2 bg-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Propose Candidate
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {adminsList.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {admin.avatar && (
                          <img
                            src={admin.avatar}
                            alt={admin.displayName}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{admin.displayName}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                          {admin.adminExpiresAt && (
                            <p className="text-xs text-yellow-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Expires: {new Date(admin.adminExpiresAt).toLocaleDateString()}
                            </p>
                          )}
                          {admin.role === "admin" && !admin.adminExpiresAt && (
                            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                              <Infinity className="w-3 h-3" />
                              Permanent Admin
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {admin.role === "owner" ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold flex items-center gap-1">
                            <Crown className="w-4 h-4" />
                            Owner
                          </span>
                        ) : (
                          <>
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold">
                              Admin
                            </span>
                            {isOwner && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const expiry = prompt("Enter expiry days (or leave empty for permanent):");
                                    if (expiry !== null) {
                                      handleUpdateRole(admin._id, "admin", expiry ? parseInt(expiry) : undefined);
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                  title="Edit Expiry"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Revoke admin privileges?")) {
                                      handleUpdateRole(admin._id, "user");
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                  title="Revoke Admin"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Propose Admin Form */}
              {showAdminForm && (
                <div className="glass-strong rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">
                      {isOwner ? "Add New Admin" : "Propose Admin Candidate"}
                    </h3>
                    <button
                      onClick={resetAdminForm}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Email Search */}
                    <div className="relative">
                      <label className="block text-sm font-semibold mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="Search user by email..."
                          value={adminFormEmail}
                          onChange={(e) => handleEmailSearch(e.target.value)}
                          className="w-full p-3 pl-10 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                        />
                      </div>
                      {adminFormSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-white/20 max-h-48 overflow-y-auto">
                          {adminFormSearchResults.map((u) => (
                            <button
                              key={u._id}
                              onClick={() => selectUserFromSearch(u)}
                              className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-3"
                            >
                              {u.avatar && (
                                <img
                                  src={u.avatar}
                                  alt={u.displayName}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-sm">{u.displayName}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Name (auto-filled) */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Name (auto-filled)"
                        value={adminFormName}
                        readOnly
                        className="w-full p-3 rounded-xl bg-gray-200 dark:bg-gray-700 border border-white/20 cursor-not-allowed"
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Why should this person become an admin?"
                        value={adminFormReason}
                        onChange={(e) => setAdminFormReason(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                        rows={4}
                      />
                    </div>

                    {/* Owner-only fields */}
                    {isOwner && (
                      <>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="permanent"
                            checked={adminFormPermanent}
                            onChange={(e) => {
                              setAdminFormPermanent(e.target.checked);
                              if (e.target.checked) setAdminFormExpiry("");
                            }}
                            className="w-5 h-5"
                          />
                          <label htmlFor="permanent" className="font-semibold flex items-center gap-2">
                            <Infinity className="w-5 h-5" />
                            Permanent Admin
                          </label>
                        </div>

                        {!adminFormPermanent && (
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Admin Until <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={adminFormExpiry}
                              onChange={(e) => setAdminFormExpiry(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Submit */}
                    <button
                      onClick={isOwner ? handleAddAdmin : handleSuggestCandidate}
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                      {isOwner ? "Add Admin" : "Suggest Candidate"}
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Candidates (Owner only) */}
              {isOwner && candidates.length > 0 && (
                <div className="glass-strong rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Pending Candidates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((candidate) => (
                      <div key={candidate._id} className="bg-white/5 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold">{candidate.candidateName}</h4>
                            <p className="text-sm text-gray-500">{candidate.candidateEmail}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500 uppercase">
                            {candidate.status}
                          </span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg mb-3">
                          <p className="text-sm italic">"{candidate.reason}"</p>
                          <p className="text-xs text-gray-500 mt-2 text-right">
                            Suggested by: {candidate.suggestedBy?.displayName}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-green-500/20 text-green-500 py-2 rounded-xl font-bold hover:bg-green-500/30 transition-colors">
                            Approve
                          </button>
                          <button className="flex-1 bg-red-500/20 text-red-500 py-2 rounded-xl font-bold hover:bg-red-500/30 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
