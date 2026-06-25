"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Shield, KeyRound } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "8+ characters required";
    if (!/[A-Z]/.test(pwd)) return "Uppercase letter required";
    if (!/[a-z]/.test(pwd)) return "Lowercase letter required";
    if (!/[0-9]/.test(pwd)) return "Number required";
    if (!/[!@#$%^&*]/.test(pwd)) return "Special character required";
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldError({});
    const newFieldErrors: Record<string, string> = {};

    if (!token) {
      setError("Missing reset token");
      return;
    }

    const pwdError = validatePassword(formData.password);
    if (pwdError) newFieldErrors.password = pwdError;
    if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords must match";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldError(newFieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.resetPassword(token, formData.password);

      if (!response.success) {
        setError(response.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex w-full">
      {/* LEFT: Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link
            href="/"
            className="inline-block mb-8 hover:opacity-70 transition-opacity"
          >
            <span className="text-2xl font-semibold text-neutral-900 font-[cursive]">F3</span>
          </Link>

          <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-neutral-900 mb-2">
            Create new password
          </h1>
          <p className="text-[15px] text-neutral-500 mb-8">
            Your new password must be strong and different from previous ones.
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-green-50 border border-green-200 rounded-xl text-center"
            >
              <h3 className="text-[16px] font-bold text-green-800 mb-2">Password reset successful</h3>
              <p className="text-[14px] text-green-700 mb-4">
                You can now sign in with your new password. Redirecting to login...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] font-medium text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                    fieldError.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                      : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                  } focus:outline-none focus:ring-4 text-neutral-900 placeholder-neutral-400`}
                  placeholder="••••••••"
                  disabled={loading || !token}
                />
                {fieldError.password && (
                  <p className="text-[12px] font-medium text-red-600 mt-1.5">
                    {fieldError.password}
                  </p>
                )}
                {!fieldError.password && formData.password && (
                  <p className="text-[12px] font-medium text-emerald-600 mt-1.5 flex items-center gap-1">
                    <Shield size={12} /> Password meets requirements
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                    fieldError.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                      : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                  } focus:outline-none focus:ring-4 text-neutral-900 placeholder-neutral-400`}
                  placeholder="••••••••"
                  disabled={loading || !token}
                />
                {fieldError.confirmPassword && (
                  <p className="text-[12px] font-medium text-red-600 mt-1.5">
                    {fieldError.confirmPassword}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || !token}
                whileHover={{ scale: loading || !token ? 1 : 1.01 }}
                whileTap={{ scale: loading || !token ? 1 : 0.99 }}
                className="w-full py-3.5 mt-6 rounded-full bg-[#ff385c] text-white text-[15px] font-bold shadow-[0_8px_24px_-4px_rgba(255,56,92,0.55)] hover:bg-[#e00b41] hover:shadow-[0_10px_28px_-4px_rgba(255,56,92,0.7)] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? "Resetting..." : "Reset Password"}
                {!loading && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </motion.button>
            </form>
          )}

          <p className="text-center text-[14px] text-neutral-600 mt-8 font-medium">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[#ff385c] hover:text-[#e00b41] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT: Showcase Panel (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-neutral-950 p-12 items-center justify-center relative overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#ff385c]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-[#ff385c]">
            <KeyRound size={32} />
          </div>
          <h2 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white mb-4">
            Secure Account <span className="text-[#ff385c]">Recovery</span>
          </h2>
          <p className="text-[16px] leading-[1.6] text-white/60 mb-10">
            Get back into your account securely. Your data and franchise intelligence are always protected.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
