"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import {
  Users,
  Crown,
  UserCheck,
  Search,
  Shield,
  X,
  ChevronRight,
  Calendar,
  Mail,
  Clock,
  Hash,
  Star,
} from "lucide-react";
import { AdminUser } from "../types";
import { formatDate } from "../utils";

// --- ANIMATION CONFIGS ---
const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

// --- ROLE CONFIGS ---
const roleConfigs: Record<string, any> = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-600 dark:text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    glow: "shadow-amber-100 dark:shadow-amber-900/20",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    glow: "shadow-violet-100 dark:shadow-violet-900/20",
  },
  user: {
    label: "Member",
    icon: UserCheck,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
    glow: "dark:shadow-slate-900/20",
  },
};

interface UsersTabProps {
  users: AdminUser[];
}

export default function UsersTab({ users }: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesSearch =
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const order: any = { owner: 0, admin: 1, user: 2 };
      return order[a.role] - order[b.role];
    });
  }, [users, searchQuery, roleFilter]);

  const groupedUsers = useMemo(() => {
    const roles = ["owner", "admin", "user"];
    return roles
      .map((role) => ({
        role,
        users: filteredUsers.filter((u) => u.role === role),
      }))
      .filter((g) => g.users.length > 0);
  }, [filteredUsers]);

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Bar - Sticky with Offset for main Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {["all", "owner", "admin", "user"].map((tab) => (
              <button
                key={tab}
                onClick={() => setRoleFilter(tab)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  roleFilter === tab
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {tab === "all" ? <Users className="w-3.5 h-3.5" /> : null}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main List */}
          <div className="flex-1 space-y-8">
            <AnimatePresence mode="popLayout">
              {groupedUsers.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No members found matching your criteria.</p>
                </motion.div>
              ) : (
                groupedUsers.map((group) => (
                  <div key={group.role} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {group.role}s — {group.users.length}
                      </h2>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                    </div>
                    <div className="grid gap-2">
                      {group.users.map((user, i) => (
                        <UserRow
                          key={user._id}
                          user={user}
                          index={i}
                          isSelected={selectedUser?._id === user._id}
                          onClick={() => setSelectedUser(user)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Sticky Detail Panel */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                {selectedUser ? (
                  <motion.div
                    key={selectedUser._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
                  </motion.div>
                ) : (
                  <div className="border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl p-8 text-center">
                    <Users className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">Select a member to view details</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-3xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center">
                <span className="font-semibold dark:text-slate-100">Member Profile</span>
                <button onClick={() => setSelectedUser(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} hideClose />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function UserRow({ user, index, isSelected, onClick }: { user: AdminUser; index: number; isSelected: boolean; onClick: () => void }) {
  const config = roleConfigs[user.role] || roleConfigs.user;

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.005, x: 4 }}
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="relative">
        <div className={`w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 ${isSelected ? 'border-blue-200 dark:border-blue-700' : 'border-transparent'}`}>
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs">
              {user.displayName.charAt(0)}
            </div>
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0 ${config.bg}`}>
          <config.icon className={`w-2.5 h-2.5 ${config.color}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>
          {user.displayName}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`hidden sm:block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
          {user.role}
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`} />
      </div>
    </motion.div>
  );
}

function UserDetailPanel({ user, onClose, hideClose = false }: { user: AdminUser; onClose: () => void; hideClose?: boolean }) {
  const config = roleConfigs[user.role] || roleConfigs.user;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg dark:shadow-slate-950">
      <div className={`h-24 ${config.bg} relative`}>
        {!hideClose && (
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="px-6 pb-6">
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-200 overflow-hidden shadow-md">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400 dark:text-slate-600">
                {user.displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.displayName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
              <config.icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Role</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="space-y-3">
            <DetailItem icon={Hash} label="User ID" value={user._id.slice(-8)} />
            <DetailItem icon={Calendar} label="Joined Date" value={formatDate(user.createdAt)} />
            {user.adminExpiresAt && (
              <DetailItem icon={Clock} label="Access Expires" value={formatDate(user.adminExpiresAt)} color="text-orange-600" />
            )}
          </div>
        </div>

        {(user.role === 'admin' || user.role === 'owner') && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">Permissions</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md border border-blue-100 dark:border-blue-800">VIEW_ANALYTICS</span>
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md border border-blue-100 dark:border-blue-800">MANAGE_USERS</span>
              {user.role === 'owner' && (
                <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-100 dark:border-amber-800">FULL_ACCESS</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, color = "text-slate-700 dark:text-slate-300" }: any) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      <div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase leading-none mb-1">{label}</p>
        <p className={`text-xs font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}