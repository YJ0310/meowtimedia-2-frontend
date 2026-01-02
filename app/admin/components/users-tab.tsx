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
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.3,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
    },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.05,
    },
  },
};

// --- TYPES ---
interface UsersTabProps {
  users: AdminUser[];
}

type RoleFilter = "all" | "user" | "admin" | "owner";

interface RoleConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

// --- ROLE CONFIGURATIONS ---
const roleConfigs: Record<string, RoleConfig> = {
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
  user: {
    label: "Member",
    icon: Users,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
    glow: "",
  },
};

// --- MAIN COMPONENT ---
export default function UsersTab({ users }: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Filter tabs config
  const filterTabs: { id: RoleFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All Members", icon: Users },
    { id: "owner", label: "Owners", icon: Crown },
    { id: "admin", label: "Admins", icon: Shield },
    { id: "user", label: "Members", icon: UserCheck },
  ];

  // Filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.displayName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    // Sort: owners first, then admins, then users
    return filtered.sort((a, b) => {
      const order = { owner: 0, admin: 1, user: 2 };
      return (order[a.role] || 2) - (order[b.role] || 2);
    });
  }, [users, searchQuery, roleFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    owners: users.filter((u) => u.role === "owner").length,
    admins: users.filter((u) => u.role === "admin").length,
    members: users.filter((u) => u.role === "user").length,
  }), [users]);

  // Group users by role for display
  const groupedUsers = useMemo(() => {
    const groups: { role: string; users: AdminUser[] }[] = [];
    const roleOrder = ["owner", "admin", "user"];

    roleOrder.forEach((role) => {
      const roleUsers = filteredUsers.filter((u) => u.role === role);
      if (roleUsers.length > 0) {
        groups.push({ role, users: roleUsers });
      }
    });

    return groups;
  }, [filteredUsers]);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  return (
    <div className="max-w-6xl mx-auto min-h-screen">
      {/* --- HEADER --- */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="px-4 md:px-6 pt-6 pb-4">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">Members</h1>
                <p className="text-sm text-muted-foreground">{stats.total} total members</p>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { label: "Owners", count: stats.owners, config: roleConfigs.owner },
                { label: "Admins", count: stats.admins, config: roleConfigs.admin },
                { label: "Members", count: stats.members, config: roleConfigs.user },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${stat.config.bg} ${stat.config.color} border ${stat.config.border}`}
                >
                  <stat.config.icon className="w-3.5 h-3.5" />
                  <span>{stat.count}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex bg-muted/50 rounded-xl p-1 border border-border/50">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                    roleFilter === tab.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {roleFilter === tab.id && (
                    <motion.div
                      layoutId="activeRoleFilter"
                      className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                      transition={pageTransition}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* --- CONTENT --- */}
      <main className="px-4 md:px-6 py-6 pb-24">
        <div className="flex gap-6">
          {/* User List - Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {filteredUsers.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No members found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search.`
                      : "No members match the current filter."}
                  </p>
                  {searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearSearch}
                      className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      Clear search
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-6"
                >
                  {groupedUsers.map((group) => (
                    <div key={group.role}>
                      {/* Role Group Header */}
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${roleConfigs[group.role]?.color || "text-muted-foreground"}`}>
                          {roleConfigs[group.role]?.label || group.role}s — {group.users.length}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>

                      {/* User Cards */}
                      <div className="space-y-1.5">
                        {group.users.map((user, i) => (
                          <UserCard
                            key={user._id}
                            user={user}
                            index={i}
                            isSelected={selectedUser?._id === user._id}
                            onClick={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Detail Panel - Sidebar */}
          <AnimatePresence>
            {selectedUser && (
              <motion.aside
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 320 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                transition={pageTransition}
                className="hidden lg:block flex-shrink-0 overflow-hidden"
              >
                <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile User Detail Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={pageTransition}
                className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- USER CARD COMPONENT ---
const UserCard = ({
  user,
  index,
  isSelected,
  onClick,
}: {
  user: AdminUser;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const config = roleConfigs[user.role] || roleConfigs.user;

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
    //   layout
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? `bg-primary/10 border border-primary/30 ${config.glow} shadow-lg`
          : "hover:bg-muted/50 border border-transparent"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.displayName}
            className={`w-10 h-10 rounded-full object-cover ring-2 transition-all ${
              isSelected ? "ring-primary" : "ring-background group-hover:ring-primary/50"
            }`}
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            }`}
          >
            {user.displayName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        {/* Role indicator dot */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${config.bg} border-2 border-background`}
        >
          <config.icon className={`w-2.5 h-2.5 ${config.color}`} />
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{user.displayName}</span>
          {user.role === "owner" && (
            <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          )}
          {user.role === "admin" && (
            <Shield className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>

      {/* Role Badge */}
      <div
        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}
      >
        {config.label}
      </div>

      {/* Arrow */}
      <ChevronRight
        className={`w-4 h-4 text-muted-foreground transition-all ${
          isSelected ? "rotate-90 text-primary" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </motion.div>
  );
};

// --- USER DETAIL PANEL ---
const UserDetailPanel = ({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) => {
  const config = roleConfigs[user.role] || roleConfigs.user;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
      {/* Header with gradient */}
      <div className={`relative h-20 ${config.bg}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="px-5 -mt-10 relative">
        <div className="relative inline-block">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className={`w-20 h-20 rounded-2xl object-cover border-4 border-card shadow-lg ${config.glow}`}
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-4 border-card shadow-lg ${config.bg} ${config.color}`}
            >
              {user.displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center ${config.bg} border-2 border-card shadow-sm`}
          >
            <config.icon className={`w-4 h-4 ${config.color}`} />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-5 pt-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{user.displayName}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Role Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${config.bg} ${config.color} border ${config.border}`}
        >
          <config.icon className="w-4 h-4" />
          {config.label}
        </div>

        {/* Details List */}
        <div className="space-y-3 pt-2">
          <DetailRow icon={Hash} label="User ID" value={user._id.slice(-8)} />
          <DetailRow icon={Mail} label="Email" value={user.email} truncate />
          {user.createdAt && (
            <DetailRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
          )}
          {user.adminExpiresAt && user.role === "admin" && (
            <DetailRow
              icon={Clock}
              label="Admin Until"
              value={formatDate(user.adminExpiresAt)}
              highlight
            />
          )}
        </div>

        {/* Permissions Section */}
        {(user.role === "admin" || user.role === "owner") && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Permissions
            </p>
            <div className="flex flex-wrap gap-2">
              {user.role === "owner" && (
                <>
                  <PermissionBadge label="Full Access" />
                  <PermissionBadge label="Manage Admins" />
                  <PermissionBadge label="Delete Data" />
                </>
              )}
              {user.role === "admin" && (
                <>
                  <PermissionBadge label="View Analytics" />
                  <PermissionBadge label="Manage Users" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DETAIL ROW ---
const DetailRow = ({
  icon: Icon,
  label,
  value,
  truncate,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  truncate?: boolean;
  highlight?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-medium ${truncate ? "truncate" : ""} ${
          highlight ? "text-violet-500" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

// --- PERMISSION BADGE ---
const PermissionBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground border border-border">
    <Star className="w-3 h-3" />
    {label}
  </span>
);