"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Shield } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

    if (!formData.first_name.trim())
      newFieldErrors.first_name = "First name required";
    if (!formData.last_name.trim())
      newFieldErrors.last_name = "Last name required";
    if (!formData.email.trim()) newFieldErrors.email = "Email required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newFieldErrors.email = "Valid email required";
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
      const response = await apiClient.register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!response.success) {
        setError(response.error || "Account creation failed");
        if (response.code === "EMAIL_ALREADY_EXISTS") {
          setFieldError({ email: "Email already registered" });
        }
        return;
      }

      if (response.data) {
        apiClient.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          accessTokenExpiry: 900000,
          refreshTokenExpiry: 604800000,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        redirect_uri: `${window.location.origin}/auth/google/callback`,
        response_type: "code",
        scope: "openid email profile",
        state: Math.random().toString(36).substring(7),
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } finally {
      // Intentionally not setting false to keep loading state during redirect
    }
  };

  const handleMicrosoftAuth = async () => {
    setMicrosoftLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "",
        redirect_uri: `${window.location.origin}/auth/microsoft/callback`,
        response_type: "code",
        scope: "openid email profile User.Read",
        state: Math.random().toString(36).substring(7),
      });
      window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
    } finally {
      // Intentionally not setting false to keep loading state during redirect
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
            Create account
          </h1>
          <p className="text-[15px] text-neutral-500 mb-8">
            Start managing your franchise network securely.
          </p>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                  First name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                    fieldError.first_name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                      : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                  } focus:outline-none focus:ring-4 text-neutral-900 placeholder-neutral-400`}
                  placeholder="John"
                  disabled={loading}
                />
                {fieldError.first_name && (
                  <p className="text-[12px] font-medium text-red-600 mt-1.5">
                    {fieldError.first_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                  Last name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                    fieldError.last_name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                      : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                  } focus:outline-none focus:ring-4 text-neutral-900 placeholder-neutral-400`}
                  placeholder="Doe"
                  disabled={loading}
                />
                {fieldError.last_name && (
                  <p className="text-[12px] font-medium text-red-600 mt-1.5">
                    {fieldError.last_name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                  fieldError.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                    : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                } focus:outline-none focus:ring-4 text-neutral-900 placeholder-neutral-400`}
                placeholder="you@example.com"
                disabled={loading}
              />
              {fieldError.email && (
                <p className="text-[12px] font-medium text-red-600 mt-1.5">
                  {fieldError.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                Password
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
                disabled={loading}
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
                Confirm password
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
                disabled={loading}
              />
              {fieldError.confirmPassword && (
                <p className="text-[12px] font-medium text-red-600 mt-1.5">
                  {fieldError.confirmPassword}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full py-3.5 mt-6 rounded-full bg-[#ff385c] text-white text-[15px] font-bold shadow-[0_8px_24px_-4px_rgba(255,56,92,0.55)] hover:bg-[#e00b41] hover:shadow-[0_10px_28px_-4px_rgba(255,56,92,0.7)] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </motion.button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-[13px] font-semibold">
              <span className="px-3 bg-white text-neutral-400 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || microsoftLoading || loading}
              whileHover={{ scale: googleLoading || microsoftLoading || loading ? 1 : 1.01 }}
              whileTap={{ scale: googleLoading || microsoftLoading || loading ? 1 : 0.99 }}
              className="w-full py-3 border-2 border-neutral-200 rounded-full text-[14px] font-bold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? "Signing up..." : "Continue with Google"}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleMicrosoftAuth}
              disabled={googleLoading || microsoftLoading || loading}
              whileHover={{ scale: googleLoading || microsoftLoading || loading ? 1 : 1.01 }}
              whileTap={{ scale: googleLoading || microsoftLoading || loading ? 1 : 0.99 }}
              className="w-full py-3 border-2 border-neutral-200 rounded-full text-[14px] font-bold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <path fill="#f25022" d="M1 1h9v9H1z"/>
                <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                <path fill="#ffb900" d="M11 11h9v9h-9z"/>
              </svg>
              {microsoftLoading ? "Signing up..." : "Continue with Microsoft"}
            </motion.button>
          </div>

          <p className="text-center text-[14px] text-neutral-600 mt-8 font-medium">
            Already have an account?{" "}
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
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#ff385c]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

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
            <Shield size={32} />
          </div>
          <h2 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white mb-4">
            Protect and scale your{" "}
            <span className="text-[#ff385c]">locations</span>
          </h2>
          <p className="text-[16px] leading-[1.6] text-white/60 mb-10">
            Anomaly detection and risk scoring across all your systems. Spot
            issues before they become revenue problems.
          </p>

          <div className="flex flex-col gap-3">
            {[
              "Real-time fraud alerts",
              "Automated chargeback defense",
              "Role-based access control",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
              >
                <div className="h-6 w-6 rounded-full bg-[#ff385c]/20 flex items-center justify-center">
                  <Shield size={12} className="text-[#ff385c]" />
                </div>
                <span className="text-[14px] font-medium text-white/80">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
