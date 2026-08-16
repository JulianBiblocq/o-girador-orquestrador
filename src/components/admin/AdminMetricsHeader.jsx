import React from 'react';
import { Shield, Plus, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function AdminMetricsHeader({ 
  totalAssocs, 
  activeCount, 
  warningCount, 
  expiredCount, 
  onOpenCreate, 
  onReload 
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="bg-[#fdf6e7] xilo-border rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b4513] text-[#fdf6e7] text-xs font-bold uppercase rounded mb-2">
            <Shield className="w-3.5 h-3.5" /> {t('admin.badge')}
          </div>
          <h1 className="text-3xl font-extrabold font-cordel text-[#4a2e1b]">
            {t('admin.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#8b4513]">
            {t('admin.subtitle')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenCreate}
            className="px-5 py-2.5 bg-[#8b4513] hover:bg-[#6e370f] text-[#fdf6e7] font-bold text-xs rounded-lg transition-all shadow flex items-center gap-2 cursor-pointer border border-[#4a2e1b]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.newBtn')}</span>
          </button>
          <button
            onClick={onReload}
            className="p-2.5 bg-[#f4e8cf] hover:bg-[#ebd8b3] text-[#4a2e1b] rounded-lg border border-[#8b4513]/40 cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 p-5 rounded-xl border-2 border-[#4a2e1b] shadow">
          <span className="text-[10px] font-bold uppercase text-[#8b4513]">Total Structures</span>
          <div className="text-3xl font-black text-[#4a2e1b] font-cordel mt-1">{totalAssocs}</div>
          <span className="text-xs text-gray-500">Associations enregistrées</span>
        </div>

        <div className="bg-white/80 p-5 rounded-xl border-2 border-[#4a2e1b] shadow">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Abonnements Actifs</span>
          <div className="text-3xl font-black text-emerald-800 font-cordel mt-1">{activeCount}</div>
          <span className="text-xs text-gray-500">Accès complet illimité</span>
        </div>

        <div className="bg-white/80 p-5 rounded-xl border-2 border-[#4a2e1b] shadow">
          <span className="text-[10px] font-bold uppercase text-amber-700">Relances en cours</span>
          <div className="text-3xl font-black text-amber-800 font-cordel mt-1">{warningCount}</div>
          <span className="text-xs text-gray-500">Échéance J-30 à J-7</span>
        </div>

        <div className="bg-white/80 p-5 rounded-xl border-2 border-[#4a2e1b] shadow">
          <span className="text-[10px] font-bold uppercase text-red-700">Restreints / Expirés</span>
          <div className="text-3xl font-black text-red-800 font-cordel mt-1">{expiredCount}</div>
          <span className="text-xs text-gray-500">Soft Lock (Lecture seule)</span>
        </div>
      </div>
    </div>
  );
}
