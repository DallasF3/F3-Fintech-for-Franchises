"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

function MicrosoftCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          setError("Authorization failed. Please try again.");
          setLoading(false);
          return;
        }

        const response = await apiClient.microsoftCallback({ code, state: state || undefined });

        if (!response.success) {
          setError(response.error || "Sign in failed");
          setLoading(false);
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
      } catch {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    };

    handleMicrosoftCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-[#ff385c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-600">Completing sign in...</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <a
              href="/auth/login"
              className="inline-block px-4 py-2 bg-[#ff385c] text-white text-sm font-medium rounded-lg hover:bg-[#e00b41] transition-colors"
            >
              Back to Sign In
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function MicrosoftCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#ff385c] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MicrosoftCallbackHandler />
    </Suspense>
  );
}
