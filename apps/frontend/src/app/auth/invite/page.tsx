"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  
  const [inviteDetails, setInviteDetails] = useState<{ email: string; role: string; franchise_id: string | null } | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await apiClient.verifyInvitation(token);
        if (res.success && res.data) {
          setInviteDetails(res.data);
        } else {
          setError(res.error || "This invitation is invalid or has expired.");
        }
      } catch (err: any) {
        setError("Network error verifying invitation. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
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

    if (!formData.first_name.trim()) newFieldErrors.first_name = "First name required";
    if (!formData.last_name.trim()) newFieldErrors.last_name = "Last name required";

    const pwdError = validatePassword(formData.password);
    if (pwdError) newFieldErrors.password = pwdError;
    if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords must match";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldError(newFieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.acceptInvitation({
        token: token!,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password,
      });

      if (!response.success) {
        setError(response.error || "Failed to accept invitation");
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
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff385c]/30 border-t-[#ff385c] rounded-full animate-spin" />
      </div>
    );
  }

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
          <Link href="/" className="inline-block mb-8 hover:opacity-70 transition-opacity">
            <span className="text-2xl font-semibold text-neutral-900 font-[cursive]">F3</span>
          </Link>

          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-red-500 w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Invalid Invitation</h1>
              <p className="text-neutral-500 mb-8">{error}</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#ff385c] hover:bg-rose-600 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-neutral-900 mb-2">
                Accept Invitation
              </h1>
              <p className="text-[15px] text-neutral-500 mb-8">
                You've been invited to join the platform as a <span className="font-semibold text-neutral-900 capitalize">{inviteDetails?.role}</span>.
                <br />
                Your email: <span className="font-medium text-neutral-900">{inviteDetails?.email}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
                      disabled={submitting}
                    />
                    {fieldError.first_name && (
                      <p className="text-[12px] font-medium text-red-600 mt-1.5">{fieldError.first_name}</p>
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
                      disabled={submitting}
                    />
                    {fieldError.last_name && (
                      <p className="text-[12px] font-medium text-red-600 mt-1.5">{fieldError.last_name}</p>
                    )}
                  </div>
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
                    className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                      fieldError.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                        : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                    } focus:outline-none focus:ring-4 text-neutral-900`}
                    placeholder="••••••••"
                    disabled={submitting}
                  />
                  {fieldError.password && (
                    <p className="text-[12px] font-medium text-red-600 mt-1.5">{fieldError.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-neutral-800 mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-[14px] border rounded-xl transition-all ${
                      fieldError.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                        : "border-neutral-200 focus:border-[#ff385c] focus:ring-[#ff385c]/20 bg-neutral-50 hover:bg-white focus:bg-white"
                    } focus:outline-none focus:ring-4 text-neutral-900`}
                    placeholder="••••••••"
                    disabled={submitting}
                  />
                  {fieldError.confirmPassword && (
                    <p className="text-[12px] font-medium text-red-600 mt-1.5">{fieldError.confirmPassword}</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#ff385c] text-white py-3.5 rounded-xl text-[15px] font-bold hover:bg-rose-600 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center min-h-[52px]"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Complete Registration"
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>

      {/* RIGHT: Visual Panel */}
      <div className="hidden lg:flex flex-1 bg-neutral-50 relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 w-full max-w-lg">
          <h2 className="text-[32px] font-bold text-neutral-900 leading-[1.2] mb-4">
            Join your team.
          </h2>
          <p className="text-lg text-neutral-500">
            Accept this invitation to get instant access to the operational dashboard and start growing your franchise network.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff385c]/30 border-t-[#ff385c] rounded-full animate-spin" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
