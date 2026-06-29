'use client';

import React, { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Trash2, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Integration {
  id: string;
  type: 'clover' | 'square' | 'payment' | 'salesforce';
  status: 'connected' | 'disconnected' | 'error';
  store_id: string | null;
  last_sync_at: string | null;
  last_error: string | null;
}

interface SyncRun {
  id: string;
  sync_type: string;
  status: string;
  records_fetched: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export default function IntegrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [integration, setIntegration] = useState<Integration | null>(null);
  const [history, setHistory] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Actions state
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [integrationsRes, historyRes] = await Promise.all([
          apiClient.getIntegrations(),
          apiClient.getSyncHistory(id)
        ]);

        if (integrationsRes.success) {
          const found = (integrationsRes.data as Integration[]).find(i => i.id === id);
          if (found) setIntegration(found);
        }

        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.testIntegration(id);
      if (res.success) {
        setTestResult({ success: true, message: 'Connection test passed successfully.' });
      } else {
        setTestResult({ success: false, message: res.error || 'Connection test failed.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'An error occurred during test.' });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect this integration? This will stop all data syncing.')) return;
    
    setDisconnecting(true);
    try {
      const res = await apiClient.disconnectIntegration(id);
      if (res.success) {
        router.push('/dashboard/integrations');
      } else {
        alert(res.error || 'Failed to disconnect');
        setDisconnecting(false);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to disconnect');
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await apiClient.triggerSync(id);
      if (res.success) {
        alert('Sync triggered successfully! Check back in a moment.');
        setTimeout(async () => {
          const hRes = await apiClient.getSyncHistory(id);
          if (hRes.success && hRes.data) setHistory(hRes.data);
        }, 3000);
      } else {
        alert(res.error || 'Sync request failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[#ff385c] animate-spin" />
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <h2 className="text-xl font-medium text-gray-900">Integration not found</h2>
        <Link href="/dashboard/integrations" className="text-[#ff385c] hover:underline mt-4 inline-block">
          Return to integrations
        </Link>
      </div>
    );
  }

  const nameMap: Record<string, string> = {
    clover: 'Clover POS',
    square: 'Square POS',
    payment: 'iAccess Payments',
    salesforce: 'Salesforce CRM'
  };

  const displayName = nameMap[integration.type] || integration.type;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/integrations" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Integrations
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-3">
            {displayName}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              integration.status === 'connected' ? 'bg-green-100 text-green-800' :
              integration.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {integration.status}
            </span>
          </h1>
          {integration.store_id && (
            <p className="text-gray-500 mt-1">Store: {integration.store_id}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Test Connection
          </button>
          
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-[#ff385c] text-white font-medium rounded-lg hover:bg-[#e03150] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>

      {testResult && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${
            testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {testResult.success ? <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-500" /> : <XCircle className="w-5 h-5 mt-0.5 text-red-500" />}
          <div>
            <h4 className="font-medium">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</h4>
            <p className="text-sm mt-1">{testResult.message}</p>
          </div>
        </motion.div>
      )}

      {/* Sync History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-medium text-gray-900">Sync History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Updates</th>
                <th className="px-6 py-4 font-medium max-w-[200px]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No sync history found for this integration yet.
                  </td>
                </tr>
              ) : (
                history.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {new Date(run.started_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {run.sync_type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        run.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        run.status === 'failed' ? 'bg-red-50 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {run.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> :
                         run.status === 'failed' ? <XCircle className="w-3 h-3 text-red-500" /> :
                         <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-xs">
                        {run.records_fetched > 0 && <span className="text-gray-600" title="Fetched">↓ {run.records_fetched}</span>}
                        {run.records_created > 0 && <span className="text-emerald-600" title="Created">+ {run.records_created}</span>}
                        {run.records_updated > 0 && <span className="text-blue-600" title="Updated">~ {run.records_updated}</span>}
                        {run.records_failed > 0 && <span className="text-red-600" title="Failed">× {run.records_failed}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={run.error_message || '-'}>
                      {run.error_message || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-red-100 pt-8 mt-12">
        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-start justify-between">
          <div>
            <h4 className="text-red-900 font-medium flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Danger Zone
            </h4>
            <p className="text-red-700 text-sm max-w-xl">
              Disconnecting this integration will immediately stop all automated data syncing. Any existing data will remain in your database, but no new updates will occur.
            </p>
          </div>
          <button 
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-4 py-2 bg-white text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50 shadow-sm"
          >
            {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
