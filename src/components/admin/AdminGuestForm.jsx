import React from 'react';
import { Mail, User, Lock, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

/**
 * Formulaire de saisie pour la création d'un compte invité / testeur.
 */
export default function AdminGuestForm({
  email,
  setEmail,
  displayName,
  setDisplayName,
  groupId,
  setGroupId,
  customGroupId,
  setCustomGroupId,
  isAutoPassword,
  setIsAutoPassword,
  manualPassword,
  setManualPassword,
  canWrite,
  setCanWrite,
  loading,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
          Adresse Email *
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="intervenant@exemple.com"
            className="w-full pl-9 pr-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
          Nom & Prénom de l'intervenant
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ex: Mestre Lucas"
            className="w-full pl-9 pr-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
          Espace cible (Groupe)
        </label>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-bold text-[#4a2e1b] rounded border border-[#8b4513]"
        >
          <option value="guest-pro">Espace Invités & Pros (guest-pro)</option>
          <option value="pif">Laboratoire Pif (pif)</option>
          <option value="custom">Saisir un autre groupe...</option>
        </select>
        {groupId === 'custom' && (
          <input
            type="text"
            required
            value={customGroupId}
            onChange={(e) => setCustomGroupId(e.target.value)}
            placeholder="identifiant-groupe-exclusif"
            className="mt-2 w-full px-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
          />
        )}
      </div>

      {/* Mot de passe */}
      <div className="p-3 bg-white/70 rounded-lg border border-[#8b4513]/20 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAutoPassword}
            onChange={(e) => setIsAutoPassword(e.target.checked)}
            className="w-4 h-4 accent-[#8b4513] rounded cursor-pointer"
          />
          <span className="text-xs font-bold text-gray-700">Générer un mot de passe automatique</span>
        </label>
        {!isAutoPassword && (
          <div className="relative pt-1">
            <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              required
              minLength={6}
              value={manualPassword}
              onChange={(e) => setManualPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full pl-9 pr-3 py-1.5 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
            />
          </div>
        )}
      </div>

      {/* Toggle Droit d'édition Séquenceur */}
      <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-[#8b4513]/20">
        <span className="text-xs font-bold text-gray-700">Droit d'édition Séquenceur (canWrite)</span>
        <button
          type="button"
          onClick={() => setCanWrite(!canWrite)}
          className="cursor-pointer text-[#8b4513]"
        >
          {canWrite ? <ToggleRight className="w-7 h-7 text-emerald-600" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#8b4513] hover:bg-[#6e370f] disabled:opacity-50 text-[#fdf6e7] font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-2 cursor-pointer border border-[#4a2e1b]"
      >
        {loading ? (
          <span>Création en cours...</span>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Générer l'accès invité</span>
          </>
        )}
      </button>
    </form>
  );
}
