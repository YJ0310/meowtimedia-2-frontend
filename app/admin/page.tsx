"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Shield, BarChart3, Users, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlobalLoading from "@/components/global-loading";
import { ToastContainer, useToast } from "@/components/toast";

// Import local modules
import { API_BASE_URL, DURATION_PRESETS } from "./constants";
import { AdminUser, FeedbackSummary, FeedbackResponse, Candidate, TabType, ModalType } from "./types";
import FeedbackTab from "./components/feedback-tab";
import UsersTab from "./components/users-tab";
import ManageAdminsTab from "./components/manage-admins-tab";
import AdminModal from "./components/admin-modal";

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
      const targetUser = users.find((u) => u.email === modalEmail);
      if (!targetUser) {
        error("Not Found", "User not found");
        return;
      }

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

  const handleEditExpiry = async () => {
    if (!selectedAdmin) return;

    if (!modalPermanent && !modalExpiry) {
      warning("Missing Expiry", "Please select an expiry date or mark as permanent");
      return;
    }

    try {
      let expiresIn: number | undefined = undefined;
      if (!modalPermanent && modalExpiry) {
        const expiryDate = new Date(modalExpiry);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        expiresIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      await handleUpdateRole(selectedAdmin._id, "admin", expiresIn);
      resetModal();
    } catch (err) {
      error("Error", "Failed to update admin expiry");
      console.error("Error updating expiry:", err);
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

  const openEditExpiryModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setModalType("editExpiry");
    setModalEmail(admin.email);
    setModalName(admin.displayName);
    setModalPermanent(!admin.adminExpiresAt);
    setModalExpiry(admin.adminExpiresAt ? new Date(admin.adminExpiresAt).toISOString().split("T")[0] : "");
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
    setSelectedAdmin(null);
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
      targetDate = new Date(now.getFullYear(), 11, 31);
    } else if (preset.days) {
      targetDate = new Date(now.getTime() + preset.days * 24 * 60 * 60 * 1000);
    } else {
      return;
    }

    setModalExpiry(targetDate.toISOString().split("T")[0]);
    setShowPresetDropdown(false);
  };

  const adminsList = useMemo(() => {
    return users.filter((u) => u.role === "admin" || u.role === "owner");
  }, [users]);

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

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "feedback"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Feedback
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>

          <button
            onClick={() => setActiveTab("manageAdmins")}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "manageAdmins"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Crown className="w-5 h-5" />
            Admins
          </button>
        </div>

        {/* Modal */}
        <AdminModal
          modalType={modalType}
          modalEmail={modalEmail}
          modalName={modalName}
          modalReason={modalReason}
          modalPermanent={modalPermanent}
          modalExpiry={modalExpiry}
          modalSearchResults={modalSearchResults}
          showPresetDropdown={showPresetDropdown}
          isOwner={isOwner}
          setModalEmail={setModalEmail}
          setModalName={setModalName}
          setModalReason={setModalReason}
          setModalPermanent={setModalPermanent}
          setModalExpiry={setModalExpiry}
          setShowPresetDropdown={setShowPresetDropdown}
          resetModal={resetModal}
          handleEmailSearch={handleEmailSearch}
          selectUserFromSearch={selectUserFromSearch}
          applyDurationPreset={applyDurationPreset}
          handleAddAdmin={handleAddAdmin}
          handleSuggestCandidate={handleSuggestCandidate}
          handleApproveCandidate={handleApproveCandidate}
          handleEditExpiry={handleEditExpiry}
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FeedbackTab summary={summary} responses={responses} />
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <UsersTab users={users} />
            </motion.div>
          )}

          {activeTab === "manageAdmins" && (
            <motion.div
              key="manageAdmins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ManageAdminsTab
                adminsList={adminsList}
                candidates={candidates}
                isOwner={isOwner}
                setModalType={setModalType}
                openEditExpiryModal={openEditExpiryModal}
                openApproveModal={openApproveModal}
                handleRejectCandidate={handleRejectCandidate}
                handleUpdateRole={handleUpdateRole}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
