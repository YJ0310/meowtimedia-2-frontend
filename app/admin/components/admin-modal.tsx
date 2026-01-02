"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Infinity,
  Search,
  UserPlus,
  Shield,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { AdminUser, ModalType } from "../types";
import { DURATION_PRESETS } from "../constants";

// --- ANIMATION CONFIGS ---
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const listItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03 },
  }),
};

// --- TYPES ---
interface AdminModalProps {
  modalType: ModalType;
  modalEmail: string;
  modalName: string;
  modalReason: string;
  modalPermanent: boolean;
  modalExpiry: string;
  modalSearchResults: AdminUser[];
  showPresetDropdown: boolean;
  isOwner: boolean;
  selectedUsers: AdminUser[];
  setModalEmail: (email: string) => void;
  setModalName: (name: string) => void;
  setModalReason: (reason: string) => void;
  setModalPermanent: (permanent: boolean) => void;
  setModalExpiry: (expiry: string) => void;
  setShowPresetDropdown: (show: boolean) => void;
  setSelectedUsers: (users: AdminUser[]) => void;
  resetModal: () => void;
  handleEmailSearch: (email: string) => void;
  selectUserFromSearch: (user: AdminUser) => void;
  removeSelectedUser: (userId: string) => void;
  applyDurationPreset: (preset: (typeof DURATION_PRESETS)[0]) => void;
  handleAddAdmin: () => void;
  handleSuggestCandidate: () => void;
  handleApproveCandidate: () => void;
  handleEditExpiry: () => void;
  warning: (title: string, message: string) => void;
}

interface ModalConfig {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  buttonLabel: string;
  buttonIcon: React.ComponentType<{ className?: string }>;
}

// --- MODAL CONFIGURATIONS ---
const modalConfigs: Record<string, ModalConfig> = {
  add: {
    title: "Add New Admin",
    subtitle: "Grant admin privileges to users",
    icon: UserPlus,
    color: "text-violet-500",
    bg: "bg-violet-500",
    buttonLabel: "Add Admin",
    buttonIcon: Shield,
  },
  propose: {
    title: "Propose Candidate",
    subtitle: "Suggest someone to become an admin",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500",
    buttonLabel: "Submit Proposal",
    buttonIcon: ChevronRight,
  },
  approve: {
    title: "Approve Candidate",
    subtitle: "Review and promote to admin",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    buttonLabel: "Approve & Promote",
    buttonIcon: Shield,
  },
  editExpiry: {
    title: "Edit Admin Expiry",
    subtitle: "Update admin access duration",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-500",
    buttonLabel: "Update Expiry",
    buttonIcon: Clock,
  },
};

// --- MAIN COMPONENT ---
export default function AdminModal({
  modalType,
  modalEmail,
  modalName,
  modalReason,
  modalPermanent,
  modalExpiry,
  modalSearchResults,
  showPresetDropdown,
  isOwner,
  selectedUsers,
  setModalEmail,
  setModalName,
  setModalReason,
  setModalPermanent,
  setModalExpiry,
  setShowPresetDropdown,
  setSelectedUsers,
  resetModal,
  handleEmailSearch,
  selectUserFromSearch,
  removeSelectedUser,
  applyDurationPreset,
  handleAddAdmin,
  handleSuggestCandidate,
  handleApproveCandidate,
  handleEditExpiry,
  warning,
}: AdminModalProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const config = modalType ? modalConfigs[modalType] : null;

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        // Clear search results by setting empty email if needed
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (modalType === "add") handleAddAdmin();
    else if (modalType === "propose") handleSuggestCandidate();
    else if (modalType === "approve") handleApproveCandidate();
    else if (modalType === "editExpiry") handleEditExpiry();
  };

  if (!modalType || !config) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => {
          if (e.target === e.currentTarget) resetModal();
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-border">
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 ${config.bg}/5 pointer-events-none`}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${config.bg}/10 flex items-center justify-center`}
                >
                  <config.icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {config.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {config.subtitle}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetModal}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* === ADD ADMIN: Multi-User Selection === */}
            {modalType === "add" && (
              <div ref={searchRef} className="relative">
                <InputLabel label="Select Users" required hint="Add multiple users" />

                {/* Selected Users Chips */}
                <AnimatePresence>
                  {selectedUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 mb-3"
                    >
                      {selectedUsers.map((user, i) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-sm"
                        >
                          <UserAvatar user={user} size="xs" />
                          <span className="font-medium max-w-[120px] truncate">
                            {user.displayName}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeSelectedUser(user._id)}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search Input */}
                <SearchInput
                  value={modalEmail}
                  onChange={handleEmailSearch}
                  placeholder="Search by email or name..."
                />

                {/* Search Results */}
                <SearchResults
                  results={modalSearchResults}
                  onSelect={selectUserFromSearch}
                />
              </div>
            )}

            {/* === PROPOSE: Single User Selection === */}
            {modalType === "propose" && (
              <div ref={searchRef} className="relative">
                <InputLabel label="Select User" required />
                <SearchInput
                  value={modalEmail}
                  onChange={handleEmailSearch}
                  placeholder="Search by email..."
                />
                <SearchResults
                  results={modalSearchResults}
                  onSelect={selectUserFromSearch}
                />
              </div>
            )}

            {/* === APPROVE / EDIT EXPIRY: Read-only User Info === */}
            {(modalType === "approve" || modalType === "editExpiry") && (
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {modalName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {modalName || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {modalEmail}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20">
                      {modalType === "approve" ? "Candidate" : "Admin"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* === REASON FIELD === */}
            {modalType !== "editExpiry" && (
              <div>
                <InputLabel
                  label="Reason"
                  required={modalType === "propose" || modalType === "approve"}
                />
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    placeholder={
                      modalType === "approve"
                        ? "Reason from the proposer..."
                        : "Why should this person become an admin?"
                    }
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    readOnly={modalType === "approve"}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm leading-relaxed resize-none transition-all ${
                      modalType === "approve"
                        ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                        : "bg-muted/30 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* === DURATION SETTINGS (Owner Only) === */}
            {isOwner && modalType !== "propose" && (
              <div className="space-y-4">
                {/* Permanent Toggle */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    setModalPermanent(!modalPermanent);
                    if (!modalPermanent) setModalExpiry("");
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    modalPermanent
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-muted/30 border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        modalPermanent ? "bg-emerald-500/20" : "bg-muted"
                      }`}
                    >
                      <Infinity
                        className={`w-5 h-5 ${
                          modalPermanent
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          modalPermanent ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                        }`}
                      >
                        Permanent Admin
                      </p>
                      <p className="text-xs text-muted-foreground">
                        No expiration date
                      </p>
                    </div>
                  </div>

                  {/* Custom Toggle Switch */}
                  <div
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      modalPermanent ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                        modalPermanent ? "ml-auto" : ""
                      }`}
                    />
                  </div>
                </motion.div>

                {/* Expiry Date Selection */}
                <AnimatePresence>
                  {!modalPermanent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <InputLabel label="Admin Duration" required />

                      {/* Quick Duration Presets */}
                      <div className="flex flex-wrap gap-2">
                        {DURATION_PRESETS.map((preset, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => applyDurationPreset(preset)}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-muted/50 border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                          >
                            {preset.label}
                          </motion.button>
                        ))}
                      </div>

                      {/* Custom Date Input */}
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={modalExpiry}
                          onChange={(e) => setModalExpiry(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                        />
                      </div>

                      {/* Selected Date Preview */}
                      {modalExpiry && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Clock className="w-4 h-4" />
                          <span>
                            Admin access expires on{" "}
                            <strong className="text-foreground">
                              {new Date(modalExpiry).toLocaleDateString(
                                undefined,
                                { dateStyle: "long" }
                              )}
                            </strong>
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Validation Warning */}
            {modalType === "add" && selectedUsers.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Select at least one user to continue</span>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/20">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetModal}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={modalType === "add" && selectedUsers.length === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${config.bg} hover:opacity-90`}
              >
                <config.buttonIcon className="w-4 h-4" />
                {config.buttonLabel}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- SUBCOMPONENTS ---

const InputLabel = ({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) => (
  <div className="flex items-baseline justify-between mb-2">
    <label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </div>
);

const SearchInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground transition-all"
    />
    <AnimatePresence>
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  </div>
);

const SearchResults = ({
  results,
  onSelect,
}: {
  results: AdminUser[];
  onSelect: (user: AdminUser) => void;
}) => (
  <AnimatePresence>
    {results.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-20 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
      >
        <div className="max-h-48 overflow-y-auto">
          {results.map((user, i) => (
            <motion.button
              key={user._id}
              variants={listItemVariants}
              initial="initial"
              animate="animate"
              custom={i}
              onClick={() => onSelect(user)}
              className="w-full p-3 hover:bg-muted/50 text-left flex items-center gap-3 transition-colors border-b border-border last:border-0"
            >
              <UserAvatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const UserAvatar = ({
  user,
  size = "sm",
}: {
  user: AdminUser;
  size?: "xs" | "sm" | "md";
}) => {
  const sizeClasses = {
    xs: "w-5 h-5 text-[10px]",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
  };

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.displayName}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-background`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold`}
    >
      {user.displayName?.[0]?.toUpperCase() || "?"}
    </div>
  );
};