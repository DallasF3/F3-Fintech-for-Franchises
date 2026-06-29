'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Monitor, CreditCard, Users, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthUser } from '@/components/rbac-guard';

const integrationOptions = [
  { id: 'square', name: 'Square POS', type: 'Point of Sale', icon: Monitor, color: 'text-gray-900', bg: 'bg-gray-100' },
  { id: 'clover', name: 'Clover POS', type: 'Point of Sale', icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'payment', name: 'iAccess Payments', type: 'Payment Processor', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'salesforce', name: 'Salesforce CRM', type: 'Customer Data & Loyalty', icon: Users, color: 'text-[#00a1e0]', bg: 'bg-blue-50' },
];

export default function SetupIntegrationPage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [storeId, setStoreId] = useState('');
  const [apiKey, setApiKey] = useState('');

  const nextStep = () => {
    if (step === 1 && !selected) return;
    setStep((prev) => prev + 1);
    setError(null);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
    setError(null);
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      if (selected === 'clover') {
        const response = await apiClient.connectClover(storeId || null);
        const redirectUrl = response.data?.redirectUrl || (response as any).redirectUrl;
        if (response.success && redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          setError(response.error || 'Failed to generate Clover URL');
          setStep(2);
        }
      } else if (selected === 'square') {
        const response = await apiClient.connectSquare(storeId || null);
        const redirectUrl = response.data?.redirectUrl || (response as any).redirectUrl;
        if (response.success && redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          setError(response.error || 'Failed to generate Square URL');
          setStep(2);
        }
      } else if (selected === 'salesforce') {
        const response = await apiClient.connectSalesforce(storeId || null);
        const redirectUrl = response.data?.redirectUrl || (response as any).redirectUrl;
        if (response.success && redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          setError(response.error || 'Failed to generate Salesforce URL');
          setStep(2);
        }
      } else if (selected === 'payment') {
        const response = await apiClient.connectPayment();
        if (response.success) {
          router.push('/dashboard/integrations?connected=payment');
        } else {
          setError(response.error || 'Failed to connect Payments');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/integrations" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Integrations
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Add New Integration</h1>
        <p className="text-gray-500 mt-2">Connect your tools to start syncing data automatically. (Step {step} of 3)</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid gap-4"
          >
            {integrationOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selected === option.id;
              
              return (
                <div
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isSelected ? 'border-[#ff385c] bg-rose-50/30' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.bg}`}>
                      <Icon className={`w-6 h-6 ${option.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{option.name}</h3>
                      <p className="text-sm text-gray-500">{option.type}</p>
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'text-[#ff385c]' : 'text-gray-300'
                  }`}>
                    {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 flex justify-end">
              <button 
                disabled={!selected}
                onClick={nextStep}
                className="px-6 py-2 bg-[#ff385c] text-white font-medium rounded-lg hover:bg-[#e03150] transition-colors disabled:opacity-50 shadow-sm"
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-medium mb-6">Configuration</h3>
            
            {user?.role === 'franchisor' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Store (Franchisor Only)</label>
                <select 
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c]"
                >
                  <option value="">Select a store (Default to first)</option>
                  <option value="store-1">Store 1 - Downtown</option>
                  <option value="store-2">Store 2 - Uptown</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Franchisors can explicitly link an integration to a particular store.</p>
              </div>
            )}

            {(selected === 'payment') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c]"
                />
              </div>
            )}

            {(selected === 'clover' || selected === 'square' || selected === 'salesforce') && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-6">
                Connecting this POS requires OAuth. Clicking continue will redirect you to the provider to authorize our application.
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Back</button>
              <button 
                onClick={nextStep}
                className="px-6 py-2 bg-[#ff385c] text-white font-medium rounded-lg hover:bg-[#e03150] transition-colors shadow-sm"
              >
                Review & Confirm
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center py-12"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#ff385c]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Ready to Connect</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You are about to connect {integrationOptions.find(i => i.id === selected)?.name}. 
              We will securely verify your credentials and establish the data connection.
            </p>
            
            <div className="flex justify-center gap-4">
              <button onClick={prevStep} disabled={connecting} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">Back</button>
              <button 
                onClick={handleConnect}
                disabled={connecting}
                className="px-8 py-2 bg-[#ff385c] text-white font-medium rounded-lg hover:bg-[#e03150] transition-colors flex items-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
                {connecting ? 'Connecting...' : 'Connect Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
