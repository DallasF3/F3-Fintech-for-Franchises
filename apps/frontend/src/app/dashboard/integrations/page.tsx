'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Settings, CheckCircle2, XCircle, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Integration {
  id: string;
  type: 'clover' | 'payment' | 'crm';
  status: 'connected' | 'disconnected' | 'error';
  last_sync_at: string | null;
  last_error: string | null;
}

const SUPPORTED_INTEGRATIONS = [
  { type: 'clover', name: 'Clover POS', category: 'Point of Sale' },
  { type: 'payment', name: 'iAccess Payments', category: 'Payment Processor' },
  { type: 'crm', name: 'Universal CRM', category: 'Customer Data & Loyalty' },
];

export default function IntegrationsDashboard() {
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load integrations from backend
  const fetchIntegrations = async () => {
    try {
      const response = await apiClient.getIntegrations();
      if (response.success && response.data) {
        setIntegrations(response.data as Integration[]);
      } else {
        setError(response.error || 'Failed to load integrations');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();

    // Check for callback parameters (e.g. ?connected=clover)
    const connectedType = searchParams.get('connected');
    if (connectedType) {
      const name = SUPPORTED_INTEGRATIONS.find(i => i.type === connectedType)?.name || connectedType;
      setSuccessMessage(`Successfully connected ${name}! Data synchronization has been scheduled.`);
      // Clear query params by replacing history
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSync = async (integrationId: string) => {
    setSyncingId(integrationId);
    try {
      const response = await apiClient.triggerSync(integrationId);
      if (response.success) {
        // Refresh integrations to get updated last_sync_at
        await fetchIntegrations();
      } else {
        alert(response.error || 'Sync request failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to trigger sync');
    } finally {
      setSyncingId(null);
    }
  };

  // Map backend configuration rows to display cards
  const getDisplayIntegrations = () => {
    return SUPPORTED_INTEGRATIONS.map(supported => {
      const active = integrations.find(i => i.type === supported.type);
      return {
        id: active?.id || null,
        type: supported.type,
        name: supported.name,
        category: supported.category,
        status: active ? active.status : 'disconnected',
        lastSync: active?.last_sync_at 
          ? new Date(active.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : 'Never',
      };
    });
  };

  const displayList = getDisplayIntegrations();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Integrations</h1>
          <p className="text-gray-500 mt-2">Manage your connected systems and data sources.</p>
        </div>
        <Link
          href="/dashboard/integrations/setup"
          className="inline-flex items-center justify-center px-4 py-2 bg-[#ff385c] text-white font-medium rounded-lg hover:bg-[#e03150] transition-transform active:scale-95 shadow-sm"
        >
          Add New Integration
        </Link>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm text-sm"
          >
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-[#ff385c] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((integration, idx) => (
            <motion.div
              key={integration.type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="border border-gray-100 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[190px]"
            >
              {/* Status indicator line at the top */}
              <div 
                className={`absolute top-0 left-0 w-full h-1 transition-colors ${
                  integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-200'
                }`} 
              />
              
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1 block">
                      {integration.category}
                    </span>
                  </div>
                  {integration.status === 'connected' && (
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {integration.status === 'connected' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={`text-sm font-medium ${
                    integration.status === 'connected' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="text-gray-500 flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-gray-400 ${syncingId === integration.id ? 'animate-spin text-[#ff385c]' : ''}`} />
                  <span>Last sync: {integration.lastSync}</span>
                </div>
                {integration.status === 'connected' && integration.id && (
                  <button 
                    disabled={syncingId !== null}
                    onClick={() => handleSync(integration.id!)}
                    className="text-[#ff385c] font-medium hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    Sync Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
