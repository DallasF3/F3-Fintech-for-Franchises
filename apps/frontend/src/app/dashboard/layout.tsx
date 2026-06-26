"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Blocks
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface User {
  userId: string;
  email: string;
  role: string;
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Integrations", href: "/dashboard/integrations", icon: Blocks },
  { name: "Team & Users", href: "/dashboard/users", icon: Users },
  { name: "Security", href: "/dashboard/security", icon: ShieldCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simple token decoding (same as before)
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
      setUser(JSON.parse(jsonPayload));
    } catch (error) {
      apiClient.clearTokens();
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      if (apiClient.getRefreshToken()) {
        await apiClient.logout();
      }
      router.push("/auth/login");
    } catch (err) {
      apiClient.clearTokens();
      router.push("/auth/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-neutral-100">
          <Link href="/dashboard" className="text-2xl font-bold text-neutral-900 font-[cursive]">
            F3
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto lg:hidden p-2 -mr-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            // Hide Team & Users if the user is a franchisee
            if (item.name === "Team & Users" && user?.role === "franchisee") {
              return null;
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-[#ff385c]/10 text-[#ff385c]" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-[#ff385c]" : "text-neutral-400"} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer in Sidebar */}
        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
              {user?.email.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {user?.email.split('@')[0]}
              </p>
              <p className="text-xs text-neutral-500 capitalize truncate">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-neutral-900 hidden sm:block">
              {navItems.find(item => item.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleLogout}
              disabled={logoutLoading}
              whileHover={{ scale: logoutLoading ? 1 : 1.02 }}
              whileTap={{ scale: logoutLoading ? 1 : 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                {logoutLoading ? "Signing out..." : "Sign out"}
              </span>
            </motion.button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
