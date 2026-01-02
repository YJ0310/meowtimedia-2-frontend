"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  UserPlus,
  Check,
  X,
  Loader2,
  Calendar,
  Crown,
  AlertTriangle,
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "candidates">("dashboard");
  
  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Action states
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleAction, setRoleAction] = useState<{ role: string; days?: number } | null>(null);

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
    if ((user?.role === "owner" || user?.role === "admin") && activeTab === "users") {
      fetchUsers();
    }
    if (user?.role === "owner" && activeTab === "candidates") {
      fetchCandidates();
    }
    if (activeTab === "dashboard") {
      fetchSummary();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { credentials: "include" });
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
      const res = await fetch(`${API_BASE_URL}/admin/feedback/summary`, { credentials: "include" });
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
      const res = await fetch(`${API_BASE_URL}/admin/candidates`, { credentials: "include" });
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

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
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
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === "dashboard"
                ? "bg-primary text-white shadow-lg"
                : "glass hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          {(user.role === "owner" || user.role === "admin") && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-primary text-white shadow-lg"
                  : "glass hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
          )}
          {user.role === "owner" && (
            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "candidates"
                  ? "bg-primary text-white shadow-lg"
                  : "glass hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Candidates
            </button>
          )}
        </div>

        {activeTab === "dashboard" && summary && (
          <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl text-center">
                      <h3 className="text-lg font-semibold mb-2">Total Feedback</h3>
                      <p className="text-4xl font-bold text-primary">{summary.total}</p>
                    </div>
                    <div className="glass p-6 rounded-2xl text-center">
                      <h3 className="text-lg font-semibold mb-2">Avg Ease of Use</h3>
                      <p className="text-4xl font-bold text-secondary">
                        {summary.avgEaseOfUse.toFixed(1)}/5
                      </p>
                    </div>
                    <div className="glass p-6 rounded-2xl text-center">
                      <h3 className="text-lg font-semibold mb-2">Avg Recommendation</h3>
                      <p className="text-4xl font-bold text-accent">
                        {summary.avgRecommendation.toFixed(1)}/5
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* First Impression */}
                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4">First Impressions</h3>
                      <div className="space-y-3">
                        {summary.firstImpression.map((item) => (
                          <div key={item._id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{item._id}</span>
                              <span className="font-bold">{item.count}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(item.count / summary.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Referral */}
                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4">Referrals</h3>
                      <div className="space-y-3">
                        {summary.referral.map((item) => (
                          <div key={item._id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item._id}</span>
                              <span className="font-bold">{item.count}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-secondary" 
                                style={{ width: `${(item.count / summary.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ease of Use Distribution */}
                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4">Ease of Use (1-5)</h3>
                      <div className="flex items-end justify-between h-40 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const count = summary.easeOfUse.find(i => i._id === rating)?.count || 0;
                          const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
                          return (
                            <div key={rating} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                                <div 
                                  className="absolute bottom-0 left-0 right-0 bg-accent rounded-t-lg transition-all duration-500"
                                  style={{ height: `${percentage}%` }}
                                />
                              </div>
                              <span className="font-bold">{rating}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommendation Distribution */}
                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4">Recommendation (1-5)</h3>
                      <div className="flex items-end justify-between h-40 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const count = summary.recommendation.find(i => i._id === rating)?.count || 0;
                          const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
                          return (
                            <div key={rating} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex-1">
                                <div 
                                  className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-lg transition-all duration-500"
                                  style={{ height: `${percentage}%` }}
                                />
                              </div>
                              <span className="font-bold">{rating}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4">Reported Issues</h3>
                      <div className="space-y-3">
                        {summary.issues.map((issue) => (
                          <div key={issue._id} className="flex justify-between items-center">
                            <span className="capitalize">{issue._id}</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                              {issue.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass p-6 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4">Suggest Admin Candidate</h3>
                      <form onSubmit={handleSuggestCandidate} className="space-y-4">
                        <input
                          type="text"
                          placeholder="Candidate Name"
                          value={suggestName}
                          onChange={(e) => setSuggestName(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Candidate Email"
                          value={suggestEmail}
                          onChange={(e) => setSuggestEmail(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                          required
                        />
                        <textarea
                          placeholder="Reason for suggestion..."
                          value={suggestReason}
                          onChange={(e) => setSuggestReason(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                          rows={3}
                          required
                        />
                        <button
                          type="submit"
                          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                        >
                          Submit Suggestion
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab (Owner Only) */}
              {activeTab === "users" && user.role === "owner" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Expires</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                {u.avatar && (
                                  <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold">{u.displayName}</div>
                                <div className="text-sm opacity-60">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                u.role === "owner"
                                  ? "bg-purple-500/20 text-purple-500"
                                  : u.role === "admin"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : "bg-gray-500/20 text-gray-500"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm opacity-60">
                            {u.adminExpiresAt
                              ? new Date(u.adminExpiresAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="p-4">
                            {u.role !== "owner" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateRole(u._id, "admin", 30)}
                                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                  title="Make Admin (30 days)"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(u._id, "admin")}
                                  className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                                  title="Make Permanent Admin"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(u._id, "user")}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                  title="Revoke Admin"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Candidates Tab (Owner Only) */}
              {activeTab === "candidates" && user.role === "owner" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidates.map((candidate) => (
                    <div key={candidate._id} className="glass p-6 rounded-2xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{candidate.candidateName}</h3>
                          <p className="text-sm opacity-60">{candidate.candidateEmail}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500 uppercase">
                          {candidate.status}
                        </span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl mb-4">
                        <p className="text-sm italic">"{candidate.reason}"</p>
                        <p className="text-xs opacity-50 mt-2 text-right">
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
                  {candidates.length === 0 && (
                    <div className="col-span-full text-center py-12 opacity-50">
                      No pending candidates
                    </div>
                  )}
                </div>
              )}
        </div>
      </div>
  );
}
