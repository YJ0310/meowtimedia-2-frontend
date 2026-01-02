"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Crown,
  Calendar,
  Clock,
  Infinity,
  Shield,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  UserCog,
  AlertCircle,
  Sparkles,
  Mail,
  MessageSquare,
  User,
  Trash2,
} from "lucide-react";
import { AdminUser, Candidate, ModalType } from "../types";
import { formatDate } from "../utils";

// --- ANIMATION CONFIGS ---
const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// --- TYPES ---
interface ManageAdminsTabProps {
  adminsList: AdminUser[];
  candidates: Candidate[];
  isOwner: boolean;
  setModalType: (type: ModalType) => void;
  openEditExpiryModal: (admin: AdminUser) => void;
  openApproveModal: (candidate: Candidate) => void;
  handleRejectCandidate: (candidateId: string) => void;
  handleUpdateRole: (userId: string, role: string, expiresIn?: number) => void;
}

type TabType = "admins" | "candidates";

// --- ROLE CONFIGURATIONS ---
const roleConfigs = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
  },
} as const;

const defaultRoleConfig = roleConfigs.admin;

// --- MAIN COMPONENT ---
export default function ManageAdminsTab({
  adminsList,
  candidates,
  isOwner,
  setModalType,
  openEditExpiryModal,
  openApproveModal,
  handleRejectCandidate,
  handleUpdateRole,
}: ManageAdminsTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>("admins");
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  // Pending candidates
  const pendingCandidates = useMemo(
    () => candidates.filter((c) => c.status === "pending"),
    [candidates]
  );

  // Separate owners and admins
  const owners = useMemo(
    () => adminsList.filter((a) => a.role === "owner"),
    [adminsList]
  );
  const admins = useMemo(
    () => adminsList.filter((a) => a.role === "admin"),
    [adminsList]
  );

  // Stats
  const stats = useMemo(
    () => ({
      owners: owners.length,
      admins: admins.length,
      pending: pendingCandidates.length,
      permanent: admins.filter((a) => !a.adminExpiresAt).length,
      temporary: admins.filter((a) => a.adminExpiresAt).length,
    }),
    [owners, admins, pendingCandidates]
  );

  const handleRevokeAdmin = (adminId: string) => {
    handleUpdateRole(adminId, "user");
    setConfirmRevoke(null);
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen">
      {/* --- HEADER --- */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="px-4 md:px-6 pt-6 pb-4">
          {/* Title Row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                  Manage Admins
                </h1>
                <p className="text-sm text-muted-foreground">
                  {stats.owners + stats.admins} admins • {stats.pending} pending
                </p>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalType(isOwner ? "add" : "propose")}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isOwner ? "Add Admin" : "Propose Candidate"}
              </span>
            </motion.button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Owners", value: stats.owners, icon: Crown, color: "text-amber-500", bg: "bg-amber-500/5" },
              { label: "Admins", value: stats.admins, icon: Shield, color: "text-violet-500", bg: "bg-violet-500/5" },
              { label: "Permanent", value: stats.permanent, icon: Infinity, color: "text-emerald-500", bg: "bg-emerald-500/5" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/5" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2 }}
                className={`${stat.bg} rounded-xl p-3 border border-border/50`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-muted/50 rounded-xl p-1 border border-border/50">
            {[
              { id: "admins" as TabType, label: "Current Admins", icon: Shield, count: stats.owners + stats.admins },
              { id: "candidates" as TabType, label: "Pending Candidates", icon: Sparkles, count: stats.pending },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    transition={pageTransition}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* --- CONTENT --- */}
      <main className="px-4 md:px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* === ADMINS TAB === */}
          {activeTab === "admins" && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
              className="space-y-6"
            >
              {/* Owners Section */}
              {owners.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                      Owners — {owners.length}
                    </span>
                    <div className="flex-1 h-px bg-amber-500/20" />
                  </div>

                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-2"
                  >
                    {owners.map((owner, i) => (
                      <AdminCard
                        key={owner._id}
                        admin={owner}
                        index={i}
                        isOwner={false}
                        isExpanded={expandedAdmin === owner._id}
                        onToggle={() =>
                          setExpandedAdmin(expandedAdmin === owner._id ? null : owner._id)
                        }
                        onEditExpiry={() => {}}
                        onRevoke={() => {}}
                        confirmRevoke={false}
                        onCancelRevoke={() => {}}
                        onConfirmRevoke={() => {}}
                      />
                    ))}
                  </motion.div>
                </section>
              )}

              {/* Admins Section */}
              <section>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Shield className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                    Admins — {admins.length}
                  </span>
                  <div className="flex-1 h-px bg-violet-500/20" />
                </div>

                {admins.length === 0 ? (
                  <EmptyState
                    icon={Shield}
                    title="No admins yet"
                    description={
                      isOwner
                        ? "Add your first admin to help manage the platform."
                        : "Propose a candidate to become an admin."
                    }
                    actionLabel={isOwner ? "Add Admin" : "Propose Candidate"}
                    onAction={() => setModalType(isOwner ? "add" : "propose")}
                  />
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-2"
                  >
                    {admins.map((admin, i) => (
                      <AdminCard
                        key={admin._id}
                        admin={admin}
                        index={i}
                        isOwner={isOwner}
                        isExpanded={expandedAdmin === admin._id}
                        onToggle={() =>
                          setExpandedAdmin(expandedAdmin === admin._id ? null : admin._id)
                        }
                        onEditExpiry={() => openEditExpiryModal(admin)}
                        onRevoke={() => setConfirmRevoke(admin._id)}
                        confirmRevoke={confirmRevoke === admin._id}
                        onCancelRevoke={() => setConfirmRevoke(null)}
                        onConfirmRevoke={() => handleRevokeAdmin(admin._id)}
                      />
                    ))}
                  </motion.div>
                )}
              </section>
            </motion.div>
          )}

          {/* === CANDIDATES TAB === */}
          {activeTab === "candidates" && (
            <motion.div
              key="candidates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              {pendingCandidates.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No pending candidates"
                  description={
                    isOwner
                      ? "All candidate proposals have been reviewed."
                      : "Propose someone to become an admin."
                  }
                  actionLabel={isOwner ? undefined : "Propose Candidate"}
                  onAction={isOwner ? undefined : () => setModalType("propose")}
                />
              ) : !isOwner ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Owner Access Required
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Only owners can review and approve pending candidates.
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {pendingCandidates.map((candidate, i) => (
                    <CandidateCard
                      key={candidate._id}
                      candidate={candidate}
                      index={i}
                      onApprove={() => openApproveModal(candidate)}
                      onReject={() => handleRejectCandidate(candidate._id)}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- ADMIN CARD ---
const AdminCard = ({
  admin,
  index,
  isOwner,
  isExpanded,
  onToggle,
  onEditExpiry,
  onRevoke,
  confirmRevoke,
  onCancelRevoke,
  onConfirmRevoke,
}: {
  admin: AdminUser;
  index: number;
  isOwner: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEditExpiry: () => void;
  onRevoke: () => void;
  confirmRevoke: boolean;
  onCancelRevoke: () => void;
  onConfirmRevoke: () => void;
}) => {
  const config = (roleConfigs[admin.role as keyof typeof roleConfigs] || defaultRoleConfig) as typeof defaultRoleConfig;
  const isPermanent = admin.role === "admin" && !admin.adminExpiresAt;
  const isTemporary = admin.role === "admin" && admin.adminExpiresAt;

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      layout
      className={`bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
        isExpanded
          ? `border-primary/30 shadow-lg ${config.glow}`
          : "border-border hover:border-primary/20"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer group"
        onClick={onToggle}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {admin.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.displayName}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-background"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${config.bg} ${config.color}`}
            >
              {admin.displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${config.bg} border-2 border-card`}
          >
            <config.icon className={`w-3 h-3 ${config.color}`} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {admin.displayName}
            </span>
            {admin.role === "owner" && (
              <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{admin.email}</p>
        </div>

        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {isPermanent && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Infinity className="w-3.5 h-3.5" />
              Permanent
            </span>
          )}
          {isTemporary && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(admin.adminExpiresAt!)}
            </span>
          )}
          {admin.role === "owner" && (
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}
            >
              <Crown className="w-3.5 h-3.5" />
              Owner
            </span>
          )}
        </div>

        {/* Expand Arrow */}
        {admin.role === "admin" && isOwner && (
          <ChevronRight
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
              isExpanded ? "rotate-90" : "group-hover:translate-x-0.5"
            }`}
          />
        )}
      </div>

      {/* Expanded Actions */}
      <AnimatePresence>
        {isExpanded && admin.role === "admin" && isOwner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20">
              {/* Mobile Status */}
              <div className="sm:hidden flex items-center gap-2 mb-3">
                {isPermanent && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Infinity className="w-3.5 h-3.5" />
                    Permanent
                  </span>
                )}
                {isTemporary && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    Expires {formatDate(admin.adminExpiresAt!)}
                  </span>
                )}
              </div>

              {/* Actions */}
              {!confirmRevoke ? (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditExpiry();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Edit Expiry
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevoke();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl text-sm font-medium hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Revoke</span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/5 border border-destructive/20 rounded-xl p-4"
                >
                  <p className="text-sm text-foreground mb-3">
                    Remove <strong>{admin.displayName}</strong> as admin?
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelRevoke();
                      }}
                      className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmRevoke();
                      }}
                      className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                    >
                      Confirm Revoke
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- CANDIDATE CARD ---
const CandidateCard = ({
  candidate,
  index,
  onApprove,
  onReject,
}: {
  candidate: Candidate;
  index: number;
  onApprove: () => void;
  onReject: () => void;
}) => {
  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-linear-to-r from-orange-500/5 to-amber-500/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg font-bold text-orange-500">
              {candidate.candidateName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                {candidate.candidateName}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {candidate.candidateEmail}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase">
            Pending
          </span>
        </div>
      </div>

      {/* Reason */}
      <div className="p-4">
        <div className="bg-muted/30 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-foreground italic leading-relaxed">
              "{candidate.reason}"
            </p>
          </div>
        </div>

        {/* Suggested By */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <User className="w-3.5 h-3.5" />
          <span>
            Suggested by{" "}
            <strong className="text-foreground">
              {candidate.suggestedBy?.displayName}
            </strong>
          </span>
          <span className="opacity-50">•</span>
          <span>{formatDate(candidate.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl text-sm font-medium hover:bg-destructive/20 border border-destructive/20 transition-all"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- EMPTY STATE ---
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
      >
        <UserPlus className="w-4 h-4" />
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);