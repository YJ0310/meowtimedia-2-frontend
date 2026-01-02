"use client";

import { UserPlus, Crown, Calendar, Clock, Infinity } from "lucide-react";
import { AdminUser, Candidate, ModalType } from "../types";
import { formatDate } from "../utils";

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
  return (
    <div className="space-y-6">
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
                          onClick={() => openEditExpiryModal(admin)}
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
                          <UserPlus className="w-4 h-4" />
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
    </div>
  );
}
