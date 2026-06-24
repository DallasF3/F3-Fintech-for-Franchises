"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mfaToken = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!code || code.length < 6) {
      setError("Please enter a valid 6-digit code or recovery code");
      return;
    }

    if (!mfaToken) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.verifyMfaLogin(mfaToken, code);

      if (!response.success) {
        setError(response.error || "Invalid verification code");
        return;
      }

      if (response.data) {
        apiClient.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          accessTokenExpiry: response.data.accessTokenExpiry,
          refreshTokenExpiry: response.data.refreshTokenExpiry,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link href="/" className="inline-block mb-8 hover:opacity-70 transition-opacity">
        <span className="text-2xl font-semibold text-neutral-900 font-[cursive]">F3</span>
      </Link>

      <div className="mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff385c]/10 text-[#ff385c] mb-6">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-neutral-900 mb-2">
          Two-Factor Authentication
        </h1>
        <p className="text-[15px] text-neutral-500">
          Please enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

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
            Authentication Code
          </label>
          <input
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
            autoComplete="one-time-code"
            maxLength={8}
            className="w-full px-4 py-3 text-[18px] tracking-widest font-mono text-center border rounded-xl transition-all border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 text-neutral-900 placeholder-neutral-400"
            placeholder="000000"
            disabled={loading}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading || !code}
          whileHover={{ scale: loading || !code ? 1 : 1.01 }}
          whileTap={{ scale: loading || !code ? 1 : 0.99 }}
          className="w-full py-3.5 mt-6 rounded-full bg-[#ff385c] text-white text-[15px] font-bold shadow-[0_8px_24px_-4px_rgba(255,56,92,0.55)] hover:bg-[#e00b41] hover:shadow-[0_10px_28px_-4px_rgba(255,56,92,0.7)] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
          {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
        </motion.button>
      </form>

      <p className="text-center text-[14px] text-neutral-600 font-medium">
        Lost your device?{" "}
        <span className="text-neutral-500 font-normal">
          Use one of your 8-character recovery codes instead.
        </span>
      </p>
      
      <p className="text-center text-[14px] text-neutral-600 mt-6 font-medium">
        <Link href="/auth/login" className="font-bold text-[#ff385c] hover:text-[#e00b41] transition-colors">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function MfaPage() {
  return (
    <div className="min-h-screen bg-white flex w-full">
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md flex justify-center"
        >
          <Suspense fallback={<div className="text-neutral-500">Loading...</div>}>
            <MfaForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
