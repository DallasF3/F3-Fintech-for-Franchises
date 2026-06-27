'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, Monitor, CreditCard, Users, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const integrationOptions = [
  { id: 'clover', name: 'Clover POS', type: 'Point of Sale', icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'payment', name: 'iAccess Payments', type: 'Payment Processor', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'crm', name: 'Universal CRM', type: 'Customer Data & Loyalty', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function SetupIntegrationPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnecting(true);
    setError(null);
    try {
      if (id === 'clover') {
        const response = await apiClient.connectClover();
        if (response.success && response.data?.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          setError(response.error || 'Failed to connect Clover POS');
        }
      } else if (id === 'crm') {
        const response = await apiClient.connectCrm();
        if (response.success) {
          window.location.href = '/dashboard/integrations?connected=crm';
        } else {
          setError(response.error || 'Failed to connect CRM');
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
        <p className="text-gray-500 mt-2">Connect your tools to start syncing data automatically.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {integrationOptions.map((option, idx) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              onClick={() => !connecting && setSelected(option.id)}
              className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                connecting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              } ${
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
              
              <div className="flex items-center gap-4">
                {isSelected && (
                  <button 
                    disabled={connecting}
                    onClick={(e) => { e.stopPropagation(); handleConnect(option.id); }}
                    className="px-6 py-2 bg-[#ff385c] text-white font-medium rounded-lg hover:bg-[#e03150] transition-colors shadow-sm disabled:opacity-55 flex items-center gap-2"
                  >
                    {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'text-[#ff385c]' : 'text-gray-300'
                }`}>
                  {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
