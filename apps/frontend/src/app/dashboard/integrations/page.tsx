'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Settings, CheckCircle2, XCircle, RefreshCw, Loader2, Sparkles, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthUser } from '@/components/rbac-guard';

interface Integration {
  id: string;
  type: 'clover' | 'square' | 'payment' | 'salesforce';
  status: 'connected' | 'disconnected' | 'error';
  store_id: string | null;
  last_sync_at: string | null;
  last_error: string | null;
}

const SUPPORTED_INTEGRATIONS = [
  { type: 'square', name: 'Square POS', category: 'Point of Sale' },
  { type: 'clover', name: 'Clover POS', category: 'Point of Sale' },
  { type: 'payment', name: 'iAccess Payments', category: 'Payment Processor' },
  { type: 'salesforce', name: 'Salesforce CRM', category: 'Customer Data & Loyalty' },
];

function IntegrationsDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthUser();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    const connectedType = searchParams.get('connected');
    if (connectedType) {
      const name = SUPPORTED_INTEGRATIONS.find(i => i.type === connectedType)?.name || connectedType;
      setSuccessMessage(`Successfully connected ${name}! Data synchronization has been scheduled.`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSync = async (e: React.MouseEvent, integrationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSyncingId(integrationId);
    try {
      const response = await apiClient.triggerSync(integrationId);
      if (response.success) {
        setSuccessMessage('Sync triggered successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(response.error || 'Sync request failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to trigger sync');
    } finally {
      setSyncingId(null);
    }
  };

  const renderIntegrationCard = (supported: any, active: Integration | undefined, idx: number) => {
    const isConnected = !!active && active.status !== 'disconnected';
    const status = active?.status || 'disconnected';
    
    return (
      <Link href={isConnected ? `/dashboard/integrations/${active.id}` : '/dashboard/integrations/setup'} key={`${supported.type}-${idx}`}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.4 }}
          className="border border-gray-100 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[190px] cursor-pointer h-full"
        >
          <div 
            className={`absolute top-0 left-0 w-full h-1 transition-colors ${
              status === 'connected' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-200'
            }`} 
          />
          
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#ff385c] transition-colors">{supported.name}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1 block">
                  {supported.category}
                </span>
              </div>
              <Settings className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              {status === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : status === 'error' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-300" />
              )}
              <span className={`text-sm font-medium ${
                status === 'connected' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-gray-500'
              }`}>
                {status === 'connected' ? 'Connected' : status === 'error' ? 'Error / Failing' : 'Disconnected'}
              </span>
            </div>
            
            {active?.last_error && (
              <p className="text-xs text-red-600 mt-2 line-clamp-1 truncate">{active.last_error}</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <div className="text-gray-500 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-gray-400 ${syncingId === active?.id ? 'animate-spin text-[#ff385c]' : ''}`} />
              <span>
                {active?.last_sync_at 
                  ? `Synced: ${new Date(active.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Never synced'}
              </span>
            </div>
            {isConnected && active.id && (
              <button 
                disabled={syncingId !== null}
                onClick={(e) => handleSync(e, active.id!)}
                className="text-[#ff385c] font-medium hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                Sync Now
              </button>
            )}
          </div>
        </motion.div>
      </Link>
    );
  };

  const renderSimpleGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUPPORTED_INTEGRATIONS.map((supported, idx) => {
          const active = integrations.find(i => i.type === supported.type);
          return renderIntegrationCard(supported, active, idx);
        })}
      </div>
    );
  };

  const renderGroupedGrid = () => {
    const grouped: Record<string, Integration[]> = {};
    const unassigned: Integration[] = [];
    
    integrations.forEach(integration => {
      if (integration.store_id) {
        if (!grouped[integration.store_id]) grouped[integration.store_id] = [];
        grouped[integration.store_id].push(integration);
      } else {
        unassigned.push(integration);
      }
    });

    const storeIds = Object.keys(grouped);

    if (storeIds.length === 0 && unassigned.length === 0) {
      return renderSimpleGrid(); 
    }

    return (
      <div className="space-y-10">
        {unassigned.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Brand-Level / Unassigned
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUPPORTED_INTEGRATIONS.map((supported, idx) => {
                const active = unassigned.find(i => i.type === supported.type);
                return renderIntegrationCard(supported, active, idx);
              })}
            </div>
          </div>
        )}

        {storeIds.map(storeId => (
          <div key={storeId}>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Store: {storeId}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUPPORTED_INTEGRATIONS.map((supported, idx) => {
                const active = grouped[storeId].find(i => i.type === supported.type);
                return renderIntegrationCard(supported, active, idx);
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
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
        user?.role === 'franchisor' ? renderGroupedGrid() : renderSimpleGrid()
      )}
    </div>
  );
}

export default function IntegrationsDashboard() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
      </div>
    }>
      <IntegrationsDashboardContent />
    </Suspense>
  );
}
