"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Infinity, ChevronDown } from "lucide-react";
import { AdminUser, ModalType } from "../types";
import { DURATION_PRESETS } from "../constants";

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
  setModalEmail: (email: string) => void;
  setModalName: (name: string) => void;
  setModalReason: (reason: string) => void;
  setModalPermanent: (permanent: boolean) => void;
  setModalExpiry: (expiry: string) => void;
  setShowPresetDropdown: (show: boolean) => void;
  resetModal: () => void;
  handleEmailSearch: (email: string) => void;
  selectUserFromSearch: (user: AdminUser) => void;
  applyDurationPreset: (preset: typeof DURATION_PRESETS[0]) => void;
  handleAddAdmin: () => void;
  handleSuggestCandidate: () => void;
  handleApproveCandidate: () => void;
  handleEditExpiry: () => void;
}

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
  setModalEmail,
  setModalName,
  setModalReason,
  setModalPermanent,
  setModalExpiry,
  setShowPresetDropdown,
  resetModal,
  handleEmailSearch,
  selectUserFromSearch,
  applyDurationPreset,
  handleAddAdmin,
  handleSuggestCandidate,
  handleApproveCandidate,
  handleEditExpiry,
}: AdminModalProps) {
  return (
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
                {modalType === "editExpiry" && "Edit Admin Expiry"}
              </h3>
              <button
                onClick={resetModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email Search (for add/propose, not approve/editExpiry) */}
              {modalType !== "approve" && modalType !== "editExpiry" && (
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

              {/* Email (read-only for approve/editExpiry) */}
              {(modalType === "approve" || modalType === "editExpiry") && (
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
              {modalType !== "editExpiry" && (
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
              )}

              {/* Owner-only fields (for add, approve, and editExpiry) */}
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
                  else if (modalType === "editExpiry") handleEditExpiry();
                }}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                {modalType === "add" && "Add Admin"}
                {modalType === "propose" && "Suggest Candidate"}
                {modalType === "approve" && "Approve & Promote"}
                {modalType === "editExpiry" && "Update Expiry"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
