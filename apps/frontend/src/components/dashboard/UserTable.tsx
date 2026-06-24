"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Store, 
  User, 
  UserX,
  Mail,
  Calendar,
  ChevronDown
} from "lucide-react";
import { User as UserType } from "@/lib/api-client";

interface UserTableProps {
  users: UserType[];
  currentUser: any;
  onUpdateRole: (userId: string, newRole: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDelete: (userId: string) => void;
  isLoading: boolean;
}

export function UserTable({ users, currentUser, onUpdateRole, onToggleStatus, onDelete, isLoading }: UserTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  const closeMenu = () => setActiveMenuId(null);

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin": return <ShieldAlert size={16} className="text-rose-500" />;
      case "franchisor": return <Store size={16} className="text-amber-500" />;
      case "franchisee": return <User size={16} className="text-blue-500" />;
      default: return <User size={16} className="text-neutral-500" />;
    }
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin": return "bg-rose-50 text-rose-700 border-rose-200";
      case "franchisor": return "bg-amber-50 text-amber-700 border-amber-200";
      case "franchisee": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-neutral-200 rounded-xl bg-white">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-8 h-8 rounded-full border-4 border-[#ff385c] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Loading team members...</p>
        </motion.div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full p-12 text-center border border-neutral-200 rounded-xl bg-white">
        <UsersIcon />
        <h3 className="text-lg font-medium text-neutral-900 mt-4">No users found</h3>
        <p className="text-neutral-500 mt-2 text-sm max-w-sm mx-auto">There are no users to display in this list. When users are added, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider font-semibold text-neutral-500">
              <th className="px-6 py-4 rounded-tl-xl">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((user) => {
              const isSelf = currentUser?.userId === user.id;
              const isActionable = currentUser?.role === "admin" || (currentUser?.role === "franchisor" && user.role === "franchisee" && !isSelf);
              const isMenuActive = activeMenuId === user.id;

              return (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                        user.is_active === false ? "bg-neutral-300" : "bg-gradient-to-br from-neutral-800 to-neutral-900"
                      }`}>
                        {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 flex items-center gap-2">
                          {user.first_name} {user.last_name}
                          {isSelf && <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">You</span>}
                        </div>
                        <div className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadgeClasses(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      user.is_active !== false 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${user.is_active !== false ? "bg-emerald-500" : "bg-neutral-400"}`} />
                      {user.is_active !== false ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-500 flex items-center gap-1.5">
                      <Calendar size={14} />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    {isActionable ? (
                      <div className="relative inline-block text-left">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleMenu(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isMenuActive ? "bg-[#ff385c]/10 text-[#ff385c]" : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                          }`}
                        >
                          <MoreVertical size={18} />
                        </motion.button>

                        <AnimatePresence>
                          {isMenuActive && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={closeMenu} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-neutral-100 ring-1 ring-black/5 z-40 py-1 overflow-hidden"
                              >
                                {currentUser?.role === "admin" && (
                                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-100 mb-1">
                                    Change Role
                                  </div>
                                )}
                                
                                {currentUser?.role === "admin" && user.role !== "admin" && (
                                  <button
                                    onClick={() => { onUpdateRole(user.id, "admin"); closeMenu(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <ShieldAlert size={14} className="text-rose-500" />
                                    Make Admin
                                  </button>
                                )}
                                
                                {currentUser?.role === "admin" && user.role !== "franchisor" && (
                                  <button
                                    onClick={() => { onUpdateRole(user.id, "franchisor"); closeMenu(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <Store size={14} className="text-amber-500" />
                                    Make Franchisor
                                  </button>
                                )}
                                
                                {currentUser?.role === "admin" && user.role !== "franchisee" && (
                                  <button
                                    onClick={() => { onUpdateRole(user.id, "franchisee"); closeMenu(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <User size={14} className="text-blue-500" />
                                    Make Franchisee
                                  </button>
                                )}

                                <div className="h-px bg-neutral-100 my-1" />
                                
                                <button
                                  onClick={() => { onToggleStatus(user.id, user.is_active !== false); closeMenu(); }}
                                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  {user.is_active !== false ? (
                                    <><UserX size={14} className="text-amber-600" /> Suspend Access</>
                                  ) : (
                                    <><ShieldCheck size={14} className="text-emerald-600" /> Restore Access</>
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => { onDelete(user.id); closeMenu(); }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <UserX size={14} />
                                  Delete User
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">No access</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
      <User size={32} />
    </div>
  );
}
