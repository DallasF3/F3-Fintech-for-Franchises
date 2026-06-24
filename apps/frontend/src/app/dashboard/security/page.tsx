"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { apiClient } from "@/lib/api-client";

export default function SecuritySettingsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.setupMfa();
      if (res.success && res.data) {
        setSetupData(res.data);
      } else {
        setError(res.error || "Failed to initiate MFA setup");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (code.length < 6) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.confirmMfa(code);
      if (res.success && res.data) {
        setRecoveryCodes(res.data.recoveryCodes);
      } else {
        setError(res.error || "Invalid verification code");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    if (!recoveryCodes) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
          <div className="h-14 w-14 rounded-full bg-[#ff385c]/10 flex items-center justify-center text-[#ff385c]">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Security Settings</h1>
            <p className="text-neutral-500 mt-1">Manage your Two-Factor Authentication</p>
          </div>
        </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 flex items-start gap-3"
            >
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          {/* State 1: Initial View (Not started) */}
          {!setupData && !recoveryCodes && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Enable Two-Factor Authentication</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Add an extra layer of security to your account. Once enabled, you'll be prompted to enter a 6-digit code from your authenticator app (like Google Authenticator or Authy) when signing in.
              </p>
              <button
                onClick={handleStartSetup}
                disabled={loading}
                className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Starting..." : "Set up MFA"}
              </button>
            </motion.div>
          )}

          {/* State 2: Setup Wizard (QR Code) */}
          {setupData && !recoveryCodes && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">1. Scan QR Code</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                    Open your authenticator app and scan this QR code, or manually enter the secret key below.
                  </p>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center font-mono text-xs text-neutral-600 break-all">
                    {setupData.secret}
                  </div>
                </div>
                <div className="flex justify-center p-6 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                  <QRCodeCanvas value={setupData.otpauthUrl} size={160} level="M" />
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-100">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">2. Verify Code</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Enter the 6-digit verification code generated by your app.
                </p>
                <div className="flex gap-4 max-w-sm">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="flex-1 px-4 py-3 text-center tracking-widest font-mono text-lg border border-neutral-200 rounded-xl focus:outline-none focus:border-[#ff385c] focus:ring-4 focus:ring-[#ff385c]/10"
                  />
                  <button
                    onClick={handleConfirm}
                    disabled={loading || code.length !== 6}
                    className="px-6 py-3 bg-[#ff385c] text-white font-bold rounded-xl hover:bg-[#e00b41] disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* State 3: Success & Recovery Codes */}
          {recoveryCodes && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="flex items-center gap-3 text-green-600 mb-6">
                <CheckCircle2 size={24} />
                <h3 className="text-xl font-bold">MFA Enabled Successfully</h3>
              </div>
              
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl mb-8">
                <h4 className="font-semibold text-amber-900 mb-2">Save your recovery codes</h4>
                <p className="text-amber-800 text-sm mb-4">
                  If you lose access to your authenticator app, you can use these backup codes to sign in. 
                  Each code can only be used once. <strong>Keep them somewhere safe.</strong>
                </p>
                
                <div className="bg-white border border-amber-100 rounded-xl p-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm text-neutral-700 mb-4">
                  {recoveryCodes.map((c, i) => (
                    <div key={i}>{c}</div>
                  ))}
                </div>

                <button
                  onClick={copyRecoveryCodes}
                  className="flex items-center gap-2 text-sm font-medium text-amber-900 hover:text-amber-700 transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy codes to clipboard"}
                </button>
              </div>

              <button
                onClick={() => setRecoveryCodes(null)}
                className="inline-block px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
    </motion.div>
  );
}
