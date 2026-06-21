"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

    if (!formData.first_name.trim()) newFieldErrors.first_name = "First name required";
    if (!formData.last_name.trim()) newFieldErrors.last_name = "Last name required";
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
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4 hover:opacity-70 transition-opacity">
            <span className="text-xl font-semibold text-neutral-900">F3</span>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Create account</h1>
          <p className="text-sm text-neutral-600">Start managing your franchise network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                First name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg transition-colors ${
                  fieldError.first_name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-[#ff385c]"
                } focus:outline-none focus:ring-1 bg-white text-neutral-900 placeholder-neutral-500`}
                placeholder="John"
                disabled={loading}
              />
              {fieldError.first_name && (
                <p className="text-xs text-red-600 mt-1">{fieldError.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Last name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg transition-colors ${
                  fieldError.last_name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-[#ff385c]"
                } focus:outline-none focus:ring-1 bg-white text-neutral-900 placeholder-neutral-500`}
                placeholder="Doe"
                disabled={loading}
              />
              {fieldError.last_name && (
                <p className="text-xs text-red-600 mt-1">{fieldError.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg transition-colors ${
                fieldError.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-neutral-300 focus:ring-[#ff385c]"
              } focus:outline-none focus:ring-1 bg-white text-neutral-900 placeholder-neutral-500`}
              placeholder="you@example.com"
              disabled={loading}
            />
            {fieldError.email && (
              <p className="text-xs text-red-600 mt-1">{fieldError.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg transition-colors ${
                fieldError.password
                  ? "border-red-300 focus:ring-red-500"
                  : "border-neutral-300 focus:ring-[#ff385c]"
              } focus:outline-none focus:ring-1 bg-white text-neutral-900 placeholder-neutral-500`}
              placeholder="••••••••"
              disabled={loading}
            />
            {fieldError.password && (
              <p className="text-xs text-red-600 mt-1">{fieldError.password}</p>
            )}
            {!fieldError.password && formData.password && (
              <p className="text-xs text-green-600 mt-1">✓ Password valid</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Confirm password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg transition-colors ${
                fieldError.confirmPassword
                  ? "border-red-300 focus:ring-red-500"
                  : "border-neutral-300 focus:ring-[#ff385c]"
              } focus:outline-none focus:ring-1 bg-white text-neutral-900 placeholder-neutral-500`}
              placeholder="••••••••"
              disabled={loading}
            />
            {fieldError.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{fieldError.confirmPassword}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-2.5 mt-6 rounded-lg bg-[#ff385c] text-white text-sm font-medium hover:bg-[#e00b41] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </motion.button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-600">or</span>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          whileHover={{ scale: googleLoading || loading ? 1 : 1.02 }}
          whileTap={{ scale: googleLoading || loading ? 1 : 0.98 }}
          className="w-full py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

        <p className="text-center text-sm text-neutral-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-[#ff385c] hover:text-[#e00b41] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
