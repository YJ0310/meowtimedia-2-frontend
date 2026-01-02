"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import GlobalLoading from "@/components/global-loading";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

interface AdminUser {
  _id: string;
  displayName: string;
  email: string;
  role: "user" | "admin" | "owner";
  adminExpiresAt?: string;
  avatar?: string;
  lastLogin?: string;
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

interface Candidate {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  reason: string;
  suggestedBy: { displayName: string; email: string };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "candidates">(
    "dashboard"
  );

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Action states
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleAction, setRoleAction] = useState<{ role: string; days?: number } | null>(
    null
  );

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
    if (activeTab === "dashboard") {
      fetchSummary();
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
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feedback/summary`, {
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
        setSelectedUser(null);
        setRoleAction(null);
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

  if (authLoading || !user) return <GlobalLoading isLoading={true} />;

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalOwners = users.filter((u) => u.role === "owner").length;

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Console
            </h1>
            <p className="text-neutral-dark dark:text-gray-400 mt-2 text-sm">
              Logged in as {user.displayName} ({user.role})
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-1 border-b border-white/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-t-xl font-medium text-sm flex items-center gap-2 border-b-2 ${
              activeTab === "dashboard"
                ? "border-primary text-primary bg-white/70 dark:bg-white/5"
                : "border-transparent text-gray-500 hover:text-primary"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Feedback Summary
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
              Users / Admins
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

        {/* DASHBOARD / FEEDBACK TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {isLoadingData && !summary ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !summary || summary.total === 0 ? (
              <div className="glass p-8 rounded-2xl text-center text-sm text-gray-500">
                No feedback responses yet.
              </div>
            ) : (
              <>
                {/* Overall stats like Google Forms top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-2xl">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Responses
                    </p>
                    <p className="text-3xl font-bold">{summary.total}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Total feedback submitted
                    </p>
                  </div>

                  <div className="glass p-6 rounded-2xl">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Ease of use
                    </p>
                    <p className="text-3xl font-bold text-secondary">
                      {summary.avgEaseOfUse.toFixed(1)}/5
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Average score across all users
                    </p>
                  </div>

                  <div className="glass p-6 rounded-2xl">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Recommendation
                    </p>
                    <p className="text-3xl font-bold text-accent">
                      {summary.avgRecommendation.toFixed(1)}/5
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Likelihood to recommend
                    </p>
                  </div>
                </div>

                {/* Question-style breakdown */}
                <div className="space-y-8">
                  {/* Q1 & Q2 style cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* First Impressions */}
                    <div className="glass p-6 rounded-2xl">
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Q1 • First impression of MeowtiMap
                        </h3>
                        <span className="text-xs text-gray-500">
                          Multiple choice
                        </span>
                      </div>
                      <div className="space-y-3">
                        {summary.firstImpression.map((item) => {
                          const pct =
                            summary.total > 0
                              ? ((item.count / summary.total) * 100).toFixed(1)
                              : "0";
                          return (
                            <div key={item._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="capitalize">{item._id}</span>
                                <span className="font-medium">
                                  {item.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Referral */}
                    <div className="glass p-6 rounded-2xl">
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-lg font-semibold">Q2 • How did you find us?</h3>
                        <span className="text-xs text-gray-500">
                          Multiple choice
                        </span>
                      </div>
                      <div className="space-y-3">
                        {summary.referral.map((item) => {
                          const pct =
                            summary.total > 0
                              ? ((item.count / summary.total) * 100).toFixed(1)
                              : "0";
                          return (
                            <div key={item._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{item._id}</span>
                                <span className="font-medium">
                                  {item.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rating distributions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ease of Use */}
                    <div className="glass p-6 rounded-2xl">
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Q3 • Ease of Use (1–5)
                        </h3>
                        <span className="text-xs text-gray-500">Linear scale</span>
                      </div>
                      <div className="flex items-end justify-between h-40 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const count =
                            summary.easeOfUse.find((i) => i._id === rating)?.count || 0;
                          const percentage =
                            summary.total > 0 ? (count / summary.total) * 100 : 0;
                          return (
                            <div
                              key={rating}
                              className="flex-1 flex flex-col items-center gap-2"
                            >
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-accent rounded-t-lg transition-all duration-300"
                                  style={{ height: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{rating}</span>
                              <span className="text-[10px] text-gray-500">
                                {count} resp.
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="glass p-6 rounded-2xl">
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Q4 • Recommendation (1–5)
                        </h3>
                        <span className="text-xs text-gray-500">Linear scale</span>
                      </div>
                      <div className="flex items-end justify-between h-40 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const count =
                            summary.recommendation.find((i) => i._id === rating)?.count ||
                            0;
                          const percentage =
                            summary.total > 0 ? (count / summary.total) * 100 : 0;
                          return (
                            <div
                              key={rating}
                              className="flex-1 flex flex-col items-center gap-2"
                            >
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-lg transition-all duration-300"
                                  style={{ height: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{rating}</span>
                              <span className="text-[10px] text-gray-500">
                                {count} resp.
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reported Issues + Suggest Admin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold mb-4">Reported issues</h3>
                      {summary.issues.length === 0 ? (
                        <p className="text-sm text-gray-500">No issues reported.</p>
                      ) : (
                        <div className="space-y-3">
                          {summary.issues.map((issue) => (
                            <div
                              key={issue._id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="capitalize">{issue._id}</span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20">
                                {issue.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold mb-4">
                        Suggest an admin candidate
                      </h3>
                      <form onSubmit={handleSuggestCandidate} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Candidate name"
                          value={suggestName}
                          onChange={(e) => setSuggestName(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white/60 dark:bg-black/20 border border-white/30 text-sm"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Candidate email"
                          value={suggestEmail}
                          onChange={(e) => setSuggestEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white/60 dark:bg-black/20 border border-white/30 text-sm"
                          required
                        />
                        <textarea
                          placeholder="Why should this person be an admin?"
                          value={suggestReason}
                          onChange={(e) => setSuggestReason(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white/60 dark:bg-black/20 border border-white/30 text-sm"
                          rows={3}
                          required
                        />
                        <button
                          type="submit"
                          className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          Submit suggestion
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* USERS TAB – admins can view, owner can edit */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Small summary like “who is admin & owner” */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-4 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Owners</p>
                <p className="text-2xl font-bold">{totalOwners}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Full control of roles & candidates
                </p>
              </div>
              <div className="glass p-4 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Admins</p>
                <p className="text-2xl font-bold">{totalAdmins}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Elevated access to admin tools
                </p>
              </div>
              <div className="glass p-4 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Total users</p>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  All roles combined
                </p>
              </div>
            </div>

            {isLoadingData && users.length === 0 ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="glass p-6 rounded-2xl text-center text-sm text-gray-500">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto glass rounded-2xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Expires</th>
                      <th className="p-4">
                        {user.role === "owner" ? "Actions" : "Permissions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="border-b border-white/5 hover:bg-white/5 text-sm"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.displayName}
                                  className="w-full h-full object-cover"
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
                            ? "No expiry"
                            : "-"}
                        </td>
                        <td className="p-4">
                          {user.role === "owner" && u.role !== "owner" ? (
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
                              <button
                                onClick={() => handleUpdateRole(u._id, "user")}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Revoke admin"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {u.role === "owner"
                                ? "Owner"
                                : "View-only (owner manages roles)"}
                            </span>
                          )}
                        </td>
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
              <div className="glass p-6 rounded-2xl text-center text-sm text-gray-500">
                No pending admin candidates.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map((candidate) => (
                  <div key={candidate._id} className="glass p-6 rounded-2xl">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}