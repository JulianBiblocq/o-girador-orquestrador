import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Unlock, Eye, Sparkles, Sliders, AlertTriangle } from 'lucide-react';
import { calculateSubscriptionStatus, getAccessRights } from '../../utils/subscriptionRights';

export default function SoftLockSimulator() {
  // Simulator test date state
  const [simulatedDays, setSimulatedDays] = useState(45); // default 45 days remaining
  const [testPlan, setTestPlan] = useState('annual');

  // Compute test date
  const simulatedEndDate = new Date(Date.now() + simulatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const simulatedGroup = {
    id: 'simulated-bloco',
    name: 'Bloco Test (Simulateur)',
    planType: testPlan,
    startDate: new Date().toISOString().split('T')[0],
    endDate: simulatedEndDate,
    appAccess: {
      sequenceur: true,
      manager: true,
      vitrine: true
    },
    universeAccess: {
      maracatu: true,
      capoeira: false,
      samba: false
    }
  };

  const rights = getAccessRights(simulatedGroup);
  const statusInfo = rights.statusInfo;

  return (
    <div className="bg-white/80 xilo-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#4a2e1b]/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b4513] text-[#fdf6e7] text-xs font-bold uppercase rounded mb-1">
            <Sliders className="w-3.5 h-3.5" />
            Banc d'Essai & Dégradation Progressive
          </div>
          <h2 className="text-2xl font-bold font-cordel text-[#4a2e1b]">
            Simulateur de Soft Lock & Droits
          </h2>
          <p className="text-xs text-gray-600">
            Ajustez le curseur de jours restants pour observer la dégradation progressive sans blocage brutal d'accès.
          </p>
        </div>

        {/* Status Badge Output */}
        <div className="text-center sm:text-right">
          <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Statut Calculé</span>
          <span className={`px-3 py-1.5 rounded-md text-xs uppercase font-extrabold shadow ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#8b4513] uppercase block">
          Scénarios de Relance Prédéfinis :
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSimulatedDays(60)}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
              simulatedDays === 60 ? 'bg-emerald-700 text-white ring-2 ring-emerald-500' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Actif (J+60)
          </button>
          <button
            onClick={() => setSimulatedDays(25)}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
              simulatedDays === 25 ? 'bg-yellow-600 text-white ring-2 ring-yellow-400' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Relance J-30 (J+25)
          </button>
          <button
            onClick={() => setSimulatedDays(12)}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
              simulatedDays === 12 ? 'bg-amber-700 text-white ring-2 ring-amber-500' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Relance J-15 (J+12)
          </button>
          <button
            onClick={() => setSimulatedDays(5)}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
              simulatedDays === 5 ? 'bg-orange-700 text-white ring-2 ring-orange-500' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Relance J-7 (J+5)
          </button>
          <button
            onClick={() => setSimulatedDays(-5)}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
              simulatedDays === -5 ? 'bg-red-800 text-white ring-2 ring-red-500' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Expiré (-5 jours)
          </button>
        </div>
      </div>

      {/* Slider Control */}
      <div className="bg-[#fdf6e7] p-4 rounded-lg border border-[#8b4513]/30 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-[#4a2e1b]">
          <span>Ajustement Manuel des Jours Restants</span>
          <span className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-[#8b4513]/40">
            {simulatedDays >= 0 ? `+${simulatedDays} jours` : `${simulatedDays} jours (Expiré)`}
          </span>
        </div>
        <input
          type="range"
          min="-30"
          max="90"
          value={simulatedDays}
          onChange={(e) => setSimulatedDays(Number(e.target.value))}
          className="w-full accent-[#8b4513] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>-30j (Expiré)</span>
          <span>0j (Aujourd'hui)</span>
          <span>+30j</span>
          <span>+90j</span>
        </div>
      </div>

      {/* Soft Lock Banner Result */}
      {rights.softLockBanner && (
        <div className={`p-4 rounded-lg border-2 text-xs font-semibold flex items-start gap-2 shadow-sm ${
          rights.isExpired
            ? 'bg-red-950 text-red-100 border-red-500'
            : 'bg-amber-100 text-amber-950 border-amber-500'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-0.5 uppercase tracking-wider text-[11px]">Bannière d'Alerte Utilisateur :</strong>
            <span>{rights.softLockBanner}</span>
          </div>
        </div>
      )}

      {/* Rights Matrix Flags Output */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        
        <div className="bg-[#fdf6e7] p-4 rounded-lg border border-[#8b4513]/30">
          <span className="text-[10px] uppercase font-bold text-[#8b4513] block mb-1">Mode Manager</span>
          <div className="flex items-center gap-2">
            {rights.isReadOnlyManager ? (
              <span className="text-amber-800 font-bold text-xs flex items-center gap-1">
                <Eye className="w-4 h-4" /> Lecture Seule
              </span>
            ) : (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <Unlock className="w-4 h-4" /> Écriture & Édition
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#fdf6e7] p-4 rounded-lg border border-[#8b4513]/30">
          <span className="text-[10px] uppercase font-bold text-[#8b4513] block mb-1">Création d'Événements</span>
          <div className="flex items-center gap-2">
            {rights.canCreateEvents ? (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Autorisé
              </span>
            ) : (
              <span className="text-red-700 font-bold text-xs flex items-center gap-1">
                <Lock className="w-4 h-4" /> Bloqué (Expiré)
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#fdf6e7] p-4 rounded-lg border border-[#8b4513]/30">
          <span className="text-[10px] uppercase font-bold text-[#8b4513] block mb-1">Édition Trésorerie</span>
          <div className="flex items-center gap-2">
            {rights.canEditTreasury ? (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Autorisé
              </span>
            ) : (
              <span className="text-red-700 font-bold text-xs flex items-center gap-1">
                <Lock className="w-4 h-4" /> Bloqué (Expiré)
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#fdf6e7] p-4 rounded-lg border border-[#8b4513]/30">
          <span className="text-[10px] uppercase font-bold text-[#8b4513] block mb-1">Niveau Séquenceur</span>
          <div className="flex items-center gap-2">
            {rights.isProSequencer ? (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Studio Pro & Cloud
              </span>
            ) : (
              <span className="text-amber-800 font-bold text-xs flex items-center gap-1">
                ⚡ Gratuit / Local uniquement
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
