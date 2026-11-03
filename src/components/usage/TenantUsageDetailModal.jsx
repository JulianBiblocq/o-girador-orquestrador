import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { fetchDetailedTenantUsage, syncTenantUsageStatsToMaster } from '../../services/orquestradorUsageService';
import UsageMembersTab from './UsageMembersTab';
import UsageVaralTab from './UsageVaralTab';
import UsageMegaphoneTab from './UsageMegaphoneTab';

export default function TenantUsageDetailModal({ association, isOpen, onClose, onStatsSynced }) {
  const [activeTab, setActiveTab] = useState('members');
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const groupId = association?.groupId || association?.id || '';
  const assocName = association?.name || association?.nom || groupId || 'Association';

  const loadAndSync = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const detailed = await fetchDetailedTenantUsage(groupId);
      setUsageData(detailed);
      const synced = await syncTenantUsageStatsToMaster(groupId, detailed.summaryStats);
      onStatsSynced?.(groupId, synced);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des statistiques.');
    } finally {
      setLoading(false);
    }
  }, [groupId, onStatsSynced]);

  useEffect(() => {
    if (isOpen && groupId) {
      setActiveTab('members');
      loadAndSync();
    }
  }, [isOpen, groupId, loadAndSync]);

  if (!isOpen || !association) return null;

  const tabs = [
    { id: 'members', label: '👥 Fréquentation & Notifications Push' },
    { id: 'varal', label: '🪢 Palmarès & Angles morts du Varal' },
    { id: 'megaphone', label: '📢 Réception des Annonces (Mégaphone)' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fdf6e7] xilo-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#4a2e1b] text-[#fdf6e7] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
              Loupe d&apos;usage • Orquestrador
            </div>
            <h3 className="text-lg font-extrabold font-cordel">{assocName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAndSync}
              disabled={loading}
              className="px-3 py-1.5 bg-[#8b4513] hover:bg-[#a0522d] disabled:opacity-50 text-[#fdf6e7] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>🔄 Actualiser en direct</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#fdf6e7] cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="px-6 pt-4 pb-2 bg-[#f4e8cf] border-b border-[#d4b895] flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#4a2e1b] text-[#fdf6e7] shadow'
                  : 'bg-[#fdf6e7] text-[#4a2e1b] hover:bg-[#e8d5b5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
              {error}
            </div>
          )}
          {loading && !usageData ? (
            <div className="py-12 text-center text-xs font-bold text-[#8b4513] animate-pulse">
              Calcul en direct des indicateurs Firestore ({groupId})...
            </div>
          ) : (
            <>
              {activeTab === 'members' && <UsageMembersTab usageData={usageData} />}
              {activeTab === 'varal' && <UsageVaralTab usageData={usageData} />}
              {activeTab === 'megaphone' && <UsageMegaphoneTab usageData={usageData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

