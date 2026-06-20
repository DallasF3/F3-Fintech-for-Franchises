"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to sign in");
        return;
      }

      // Handle MFA requirement
      if (data.data.requireMfa) {
        // TODO: Navigate to MFA verification page
        router.push(`/auth/mfa?token=${data.data.mfaToken}`);
        return;
      }

      // Store tokens (would use secure cookie in production)
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #fff2f4 45%, #ffd6df 100%)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-3/5 opacity-20"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255, 56, 92, 0.15) 1px, transparent 1px)",
            backgroundSize: "80px 100%",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-xl font-bold text-neutral-800">AI Franchise</span>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Welcome Back</h1>
          <p className="text-neutral-500">Sign in to access your franchise network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent text-neutral-800 placeholder-neutral-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-neutral-700">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#ff385c] hover:text-[#e00b41] font-medium"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent text-neutral-800 placeholder-neutral-400"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 rounded-lg bg-[#ff385c] text-white font-semibold hover:bg-[#e00b41] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(255,56,92,0.65)]"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-sm text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* OAuth Options (Placeholder) */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            className="w-full h-11 border border-neutral-200 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            disabled
          >
            Continue with Google (Coming soon)
          </button>
          <button
            type="button"
            className="w-full h-11 border border-neutral-200 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            disabled
          >
            Continue with Microsoft (Coming soon)
          </button>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-neutral-600">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-[#ff385c] hover:text-[#e00b41]">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
