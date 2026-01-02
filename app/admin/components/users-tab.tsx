"use client";

import { useState, useMemo } from "react";
import { Users, Crown, UserCheck, Search, Shield } from "lucide-react";
import { AdminUser } from "../types";
import { formatDate } from "../utils";

interface UsersTabProps {
  users: AdminUser[];
}

export default function UsersTab({ users }: UsersTabProps) {
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "user" | "admin" | "owner">("all");

  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (userRoleFilter === "user") {
      filtered = filtered.filter((u) => u.role === "user");
    } else if (userRoleFilter === "admin") {
      filtered = filtered.filter((u) => u.role === "admin");
    } else if (userRoleFilter === "owner") {
      filtered = filtered.filter((u) => u.role === "owner");
    }
    
    if (userSearch) {
      filtered = filtered.filter(
        (u) =>
          u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [users, userSearch, userRoleFilter]);

  const adminsList = useMemo(() => {
    return users.filter((u) => u.role === "admin" || u.role === "owner");
  }, [users]);

  return (
    <div className="space-y-6">
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
          <p className="text-sm text-gray-500">Filtered Results</p>
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">All Users</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 text-sm min-w-[200px]"
              />
            </div>
            
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as "all" | "user" | "admin" | "owner")}
              className="px-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="user">User Only</option>
              <option value="admin">Admin Only</option>
              <option value="owner">Owner Only</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {u.avatar && (
                  <img
                    src={u.avatar}
                    alt={u.displayName}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                )}
                <div className="flex-1">
                  <p className="font-bold text-base">{u.displayName}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  {u.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {formatDate(u.createdAt)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {u.role === "owner" ? (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    Owner
                  </span>
                ) : u.role === "admin" ? (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Admin
                    {u.adminExpiresAt && (
                      <span className="ml-1 text-xs">
                        (until {formatDate(u.adminExpiresAt)})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-500 text-sm font-bold">
                    User
                  </span>
                )}
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
    </div>
  );
}
