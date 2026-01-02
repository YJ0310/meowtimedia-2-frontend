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
} from "lucide-react";
import GlobalLoading from "@/components/global-loading";
import { ToastContainer, useToast } from "@/components/toast";
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

const DURATION_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "End of This Year", days: null, isEndOfYear: true },
  { label: "1 Year", days: 365 },
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
type ModalType = "add" | "propose" | "approve" | null;

// Format date as "dd MMM yyyy"
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error, warning, info } = useToast();

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

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalEmail, setModalEmail] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalReason, setModalReason] = useState("");
  const [modalPermanent, setModalPermanent] = useState(false);
  const [modalExpiry, setModalExpiry] = useState("");
  const [modalSearchResults, setModalSearchResults] = useState<AdminUser[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

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
      console.error("Error fetching users:", err);
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
        success("Success", "Role updated successfully!");
        fetchUsers();
      } else {
        error("Error", data.message || "Failed to update role");
      }
    } catch (err) {
      error("Error", "Failed to update role");
      console.error("Error updating role:", err);
    }
  };

  const handleSuggestCandidate = async () => {
    if (!modalEmail || !modalName || !modalReason) {
      warning("Missing Fields", "Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          candidateName: modalName,
          candidateEmail: modalEmail,
          reason: modalReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success("Success", "Candidate suggested successfully!");
        resetModal();
        fetchCandidates();
      } else {
        error("Error", data.message || "Failed to suggest candidate");
      }
    } catch (err) {
      error("Error", "Failed to suggest candidate");
      console.error("Error suggesting candidate:", err);
    }
  };

  const handleAddAdmin = async () => {
    if (!modalEmail || !modalReason) {
      warning("Missing Fields", "Please fill in email and reason");
      return;
    }

    if (!modalPermanent && !modalExpiry) {
      warning("Missing Expiry", "Please select an expiry date or mark as permanent");
      return;
    }

    try {
      // Find the user by email
      const targetUser = users.find((u) => u.email === modalEmail);
      if (!targetUser) {
        error("Not Found", "User not found");
        return;
      }

      // Calculate expiresIn (days from now)
      let expiresIn: number | undefined = undefined;
      if (!modalPermanent && modalExpiry) {
        const expiryDate = new Date(modalExpiry);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        expiresIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      await handleUpdateRole(targetUser._id, "admin", expiresIn);
      resetModal();
    } catch (err) {
      error("Error", "Failed to add admin");
      console.error("Error adding admin:", err);
    }
  };

  const handleApproveCandidate = async () => {
    if (!selectedCandidate) return;

    if (!modalPermanent && !modalExpiry) {
      warning("Missing Expiry", "Please select an expiry date or mark as permanent");
      return;
    }

    try {
      // Calculate expiresIn (days from now)
      let expiresIn: number | undefined = undefined;
      if (!modalPermanent && modalExpiry) {
        const expiryDate = new Date(modalExpiry);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        expiresIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const res = await fetch(
        `${API_BASE_URL}/admin/candidates/${selectedCandidate._id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ expiresIn }),
        }
      );
      const data = await res.json();
      if (data.success) {
        success("Success", "Candidate approved and promoted to admin!");
        resetModal();
        fetchCandidates();
        fetchUsers();
      } else {
        error("Error", data.message || "Failed to approve candidate");
      }
    } catch (err) {
      error("Error", "Failed to approve candidate");
      console.error("Error approving candidate:", err);
    }
  };

  const handleRejectCandidate = async (candidateId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/candidates/${candidateId}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        info("Rejected", "Candidate has been rejected");
        fetchCandidates();
      } else {
        error("Error", data.message || "Failed to reject candidate");
      }
    } catch (err) {
      error("Error", "Failed to reject candidate");
      console.error("Error rejecting candidate:", err);
    }
  };

  const openApproveModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setModalType("approve");
    setModalEmail(candidate.candidateEmail);
    setModalName(candidate.candidateName);
    setModalReason(candidate.reason);
    setModalPermanent(false);
    setModalExpiry("");
  };

  const resetModal = () => {
    setModalType(null);
    setModalEmail("");
    setModalName("");
    setModalReason("");
    setModalPermanent(false);
    setModalExpiry("");
    setModalSearchResults([]);
    setSelectedCandidate(null);
  };

  const handleEmailSearch = (email: string) => {
    setModalEmail(email);
    if (email.length >= 2) {
      const results = users.filter(
        (u) =>
          u.email.toLowerCase().includes(email.toLowerCase()) ||
          u.displayName.toLowerCase().includes(email.toLowerCase())
      );
      setModalSearchResults(results.slice(0, 5));
    } else {
      setModalSearchResults([]);
    }
  };

  const selectUserFromSearch = (selectedUser: AdminUser) => {
    setModalEmail(selectedUser.email);
    setModalName(selectedUser.displayName);
    setModalSearchResults([]);
  };

  const applyDurationPreset = (preset: typeof DURATION_PRESETS[0]) => {
    const now = new Date();
    let targetDate: Date;

    if (preset.isEndOfYear) {
      targetDate = new Date(now.getFullYear(), 11, 31); // Dec 31 of current year
    } else if (preset.days) {
      targetDate = new Date(now.getTime() + preset.days * 24 * 60 * 60 * 1000);
    } else {
      return;
    }

    setModalExpiry(targetDate.toISOString().split("T")[0]);
    setShowPresetDropdown(false);
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
  const renderPieChart = (
    data: { _id: string; count: number }[],
    total: number,
    getLabel: (val: string) => string
  ) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No responses yet</p>
        </div>
      );
    }

    const dataTotal = data.reduce((sum, item) => sum + item.count, 0);

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage =
            dataTotal > 0 ? ((item.count / dataTotal) * 100).toFixed(1) : 0;
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
                <span className="text-sm font-medium">{getLabel(item._id)}</span>
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
            <div
              key={rating}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-500 flex items-center justify-center"
                  style={{
                    height: `${percentage}%`,
                    minHeight: count > 0 ? "30px" : "0",
                  }}
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
      <ToastContainer toasts={toasts} onRemove={removeToast} hasNavbar />
      
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

        {/* Modal */}
        <AnimatePresence>
          {modalType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) resetModal();
              }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {modalType === "add" && "Add New Admin"}
                    {modalType === "propose" && "Propose Admin Candidate"}
                    {modalType === "approve" && "Approve Candidate"}
                  </h3>
                  <button
                    onClick={resetModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Email Search (for add/propose, not approve) */}
                  {modalType !== "approve" && (
                    <div className="relative">
                      <label className="block text-sm font-semibold mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="Search user by email..."
                          value={modalEmail}
                          onChange={(e) => handleEmailSearch(e.target.value)}
                          className="w-full p-3 pl-10 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                        />
                      </div>
                      {modalSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-white/20 max-h-48 overflow-y-auto">
                          {modalSearchResults.map((u) => (
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
                                <p className="font-semibold text-sm">
                                  {u.displayName}
                                </p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email (read-only for approve) */}
                  {modalType === "approve" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={modalEmail}
                        readOnly
                        className="w-full p-3 rounded-xl bg-gray-200 dark:bg-gray-700 border border-white/20 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {/* Name (auto-filled) */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Name (auto-filled)"
                      value={modalName}
                      readOnly
                      className="w-full p-3 rounded-xl bg-gray-200 dark:bg-gray-700 border border-white/20 cursor-not-allowed"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Reason{" "}
                      {(modalType === "propose" || modalType === "approve") && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      placeholder={
                        modalType === "approve"
                          ? "Reason from suggester (read-only)"
                          : "Why should this person become an admin?"
                      }
                      value={modalReason}
                      onChange={(e) => setModalReason(e.target.value)}
                      readOnly={modalType === "approve"}
                      className={`w-full p-3 rounded-xl border border-white/20 ${
                        modalType === "approve"
                          ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                          : "bg-white/50 dark:bg-black/20"
                      }`}
                      rows={4}
                    />
                  </div>

                  {/* Owner-only fields (for add and approve) */}
                  {isOwner && modalType !== "propose" && (
                    <>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="permanent"
                          checked={modalPermanent}
                          onChange={(e) => {
                            setModalPermanent(e.target.checked);
                            if (e.target.checked) setModalExpiry("");
                          }}
                          className="w-5 h-5"
                        />
                        <label
                          htmlFor="permanent"
                          className="font-semibold flex items-center gap-2"
                        >
                          <Infinity className="w-5 h-5" />
                          Permanent Admin
                        </label>
                      </div>

                      {!modalPermanent && (
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Admin Until <span className="text-red-500">*</span>
                          </label>
                          
                          {/* Duration Presets Dropdown */}
                          <div className="relative mb-2">
                            <button
                              type="button"
                              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                              className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 flex items-center justify-between hover:bg-white/70 dark:hover:bg-black/30 transition-colors"
                            >
                              <span className="text-sm">Quick Select Duration</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${showPresetDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showPresetDropdown && (
                              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-white/20">
                                {DURATION_PRESETS.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => applyDurationPreset(preset)}
                                    className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm"
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <input
                            type="date"
                            value={modalExpiry}
                            onChange={(e) => setModalExpiry(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={() => {
                      if (modalType === "add") handleAddAdmin();
                      else if (modalType === "propose") handleSuggestCandidate();
                      else if (modalType === "approve") handleApproveCandidate();
                    }}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    {modalType === "add" && "Add Admin"}
                    {modalType === "propose" && "Suggest Candidate"}
                    {modalType === "approve" && "Approve & Promote"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                      <h3 className="text-lg font-semibold mb-2">
                        Total Responses
                      </h3>
                      <p className="text-4xl font-bold text-primary">
                        {summary.total}
                      </p>
                    </div>
                    <div className="glass-strong rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Avg Ease of Use
                      </h3>
                      <p className="text-4xl font-bold text-secondary">
                        {summary.avgEaseOfUse.toFixed(1)}/5
                      </p>
                    </div>
                    <div className="glass-strong rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Avg Recommendation
                      </h3>
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
                      {renderPieChart(
                        summary.firstImpression,
                        summary.total,
                        getFirstImpressionLabel
                      )}
                    </div>

                    {/* 2. How Easy Was It? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4">
                        2. How Easy Was It? (1-5)
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Rate the ease of use
                      </p>
                      {renderBarChart(
                        summary.easeOfUse,
                        summary.total,
                        getEaseEmoji
                      )}
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
                      {renderBarChart(
                        summary.recommendation,
                        summary.total,
                        getRecommendEmoji
                      )}
                    </div>

                    {/* 5. Any Other Thoughts? */}
                    <div className="glass-strong rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        5. Any Other Thoughts?
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {
                          filteredResponses.filter(
                            (r) =>
                              r.additionalFeedback &&
                              r.additionalFeedback.trim().length > 0
                          ).length
                        }{" "}
                        users shared additional feedback
                      </p>
                      <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
                        {filteredResponses
                          .filter(
                            (r) =>
                              r.additionalFeedback &&
                              r.additionalFeedback.trim().length > 0
                          )
                          .map((response) => (
                            <div
                              key={response._id}
                              className="bg-white/5 p-4 rounded-xl"
                            >
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
                                    {formatDate(response.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm italic">
                                "{response.additionalFeedback}"
                              </p>
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
                                (until {formatDate(admin.adminExpiresAt)})
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
                    <p className="text-center text-gray-500 py-8">
                      No users found
                    </p>
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
                      onClick={() => setModalType("add")}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Admin
                    </button>
                  )}
                  {!isOwner && (
                    <button
                      onClick={() => setModalType("propose")}
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
                              Expires: {formatDate(admin.adminExpiresAt)}
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
                                    const expiry = prompt(
                                      "Enter expiry days (or leave empty for permanent):"
                                    );
                                    if (expiry !== null) {
                                      handleUpdateRole(
                                        admin._id,
                                        "admin",
                                        expiry ? parseInt(expiry) : undefined
                                      );
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

              {/* Pending Candidates (Owner only) */}
              {isOwner && candidates.filter((c) => c.status === "pending").length > 0 && (
                <div className="glass-strong rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Pending Candidates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates
                      .filter((c) => c.status === "pending")
                      .map((candidate) => (
                        <div
                          key={candidate._id}
                          className="bg-white/5 p-4 rounded-xl"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold">
                                {candidate.candidateName}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {candidate.candidateEmail}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Suggested on: {formatDate(candidate.createdAt)}
                              </p>
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
                            <button
                              onClick={() => openApproveModal(candidate)}
                              className="flex-1 bg-green-500/20 text-green-500 py-2 rounded-xl font-bold hover:bg-green-500/30 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCandidate(candidate._id)}
                              className="flex-1 bg-red-500/20 text-red-500 py-2 rounded-xl font-bold hover:bg-red-500/30 transition-colors"
                            >
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
