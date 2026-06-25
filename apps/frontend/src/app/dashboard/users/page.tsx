"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, ShieldAlert, AlertTriangle } from "lucide-react";
import { apiClient, User as UserType } from "@/lib/api-client";
import { UserTable } from "@/components/dashboard/UserTable";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For delete confirmation
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // For invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("franchisee");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    setInviteLoading(true);

    try {
      const res = await apiClient.inviteUser({ email: inviteEmail, role: inviteRole });
      if (!res.success) {
        throw new Error(res.error || "Failed to send invitation");
      }
      setInviteSuccess("Invitation sent successfully! Check server logs for the simulated email link.");
      setInviteEmail("");
      // Automatically close after 3 seconds
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess(null);
      }, 3000);
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.getUsers();
      if (res.success && res.data && res.data.users) {
        setUsers(res.data.users);
        setError(null);
      } else {
        setError(res.error || "Failed to load users");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      const decoded = JSON.parse(jsonPayload);
      setCurrentUser(decoded);

      // Franchisees should not be able to access this page directly 
      // (Backend will return 403, but better UX to redirect early)
      if (decoded.role === "franchisee") {
        router.push("/dashboard");
        return;
      }

      fetchUsers();
    } catch (error) {
      apiClient.clearTokens();
      router.push("/auth/login");
    }
  }, [router, fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    try {
      const res = await apiClient.updateUser(userId, { role: newRole });
      if (!res.success) {
        throw new Error(res.error || "Failed to update role");
      }
    } catch (err: any) {
      setError(err.message);
      setUsers(previousUsers); // Revert
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
    
    try {
      const res = await apiClient.updateUser(userId, { is_active: newStatus });
      if (!res.success) {
        throw new Error(res.error || "Failed to update status");
      }
    } catch (err: any) {
      setError(err.message);
      setUsers(previousUsers); // Revert
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== userToDelete));
    
    try {
      const res = await apiClient.deleteUser(userToDelete);
      if (!res.success) {
        throw new Error(res.error || "Failed to delete user");
      }
    } catch (err: any) {
      setError(err.message);
      setUsers(previousUsers); // Revert
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Team & Users</h1>
          <p className="text-neutral-500 mt-1">
            Manage your organization's users, roles, and access permissions.
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#ff385c] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm flex items-center justify-center gap-2"
          onClick={() => {
            setInviteError(null);
            setInviteSuccess(null);
            setInviteEmail("");
            setInviteRole(currentUser?.role === 'admin' ? 'franchisor' : 'franchisee');
            setIsInviteModalOpen(true);
          }}
        >
          <UserPlus size={16} />
          Invite User
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3"
        >
          <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-medium text-rose-800">Permission Error</h3>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      <UserTable 
        users={users} 
        currentUser={currentUser}
        onUpdateRole={handleUpdateRole}
        onToggleStatus={handleToggleStatus}
        onDelete={(id) => setUserToDelete(id)}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setUserToDelete(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 relative"
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Delete User</h2>
              <p className="text-neutral-500 mt-2">
                Are you sure you want to delete this user? This action will immediately revoke their access and cannot be undone.
              </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Yes, delete user
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !inviteLoading && setIsInviteModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 relative"
          >
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Invite User</h2>
              <p className="text-neutral-500 mt-1 text-sm">
                Send an email invitation to join your workspace.
              </p>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="p-6">
              {inviteError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
                  {inviteSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] outline-none"
                    disabled={inviteLoading || !!inviteSuccess}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] outline-none bg-white"
                    disabled={inviteLoading || !!inviteSuccess}
                  >
                    {currentUser?.role === 'admin' && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="franchisor">Franchisor</option>
                        <option value="franchisee">Franchisee</option>
                      </>
                    )}
                    {currentUser?.role === 'franchisor' && (
                      <option value="franchisee">Franchisee</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                  disabled={inviteLoading}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading || !!inviteSuccess}
                  className="flex-1 px-4 py-2.5 bg-[#ff385c] text-white rounded-lg font-medium hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {inviteLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
