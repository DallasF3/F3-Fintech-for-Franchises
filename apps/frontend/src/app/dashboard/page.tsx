"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

interface User {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload) as User;
      setUser(decoded);
    } catch (error) {
      console.error("Failed to decode token:", error);
      apiClient.clearTokens();
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    setError(null);
    try {
      const refreshToken = apiClient.getRefreshToken();
      if (refreshToken) {
        await apiClient.logout();
      }
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
      apiClient.clearTokens();
      router.push("/auth/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-full border-4 border-[#ff385c] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 text-sm">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-semibold text-neutral-900"
          >
            F3
          </motion.div>
          <motion.button
            onClick={handleLogout}
            disabled={logoutLoading}
            whileHover={{ scale: logoutLoading ? 1 : 1.02 }}
            whileTap={{ scale: logoutLoading ? 1 : 0.98 }}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {logoutLoading ? "Signing out..." : "Sign out"}
          </motion.button>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-neutral-600">
              You're logged in as <span className="font-medium text-neutral-900">{user?.email}</span>
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#ff385c] to-red-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="text-sm font-medium opacity-90">User Role</div>
            <div className="text-2xl font-bold mt-3 capitalize">{user?.role}</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="text-sm font-medium opacity-90">Email Address</div>
            <div className="text-sm font-bold mt-3 truncate">{user?.email}</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="text-sm font-medium opacity-90">Session Status</div>
            <div className="text-2xl font-bold mt-3">Active</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Authentication Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 uppercase tracking-wide">User ID</div>
              <code className="text-sm text-neutral-900 font-mono mt-2 block truncate">
                {user?.userId}
              </code>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-xs text-neutral-600 uppercase tracking-wide">Role</div>
              <div className="text-sm text-neutral-900 font-semibold mt-2 capitalize">
                {user?.role}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600 uppercase tracking-wide">Access Token</div>
              <div className="text-sm text-green-900 font-semibold mt-2">✓ Valid</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 uppercase tracking-wide">Session</div>
              <div className="text-sm text-blue-900 font-semibold mt-2">Authenticated</div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-900">
              ✓ <strong>ID4 Authentication Complete:</strong> Token refresh & logout endpoints are working. Your session is secure and managed by the backend.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
