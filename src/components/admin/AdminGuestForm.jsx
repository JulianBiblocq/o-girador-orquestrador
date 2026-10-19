import React from 'react';
import { Mail, User, Lock, Sparkles, ToggleLeft, ToggleRight, Clock, Calendar } from 'lucide-react';

/**
 * Formulaire de saisie pour la création d'un compte Mestre officiel ou Invité Pro.
 */
export default function AdminGuestForm({
  role = 'mestre',
  setRole,
  email,
  setEmail,
  displayName,
  setDisplayName,
  groupId,
  setGroupId,
  customGroupId,
  setCustomGroupId,
  associations = [],
  lockGroup = false,
  isAutoPassword,
  setIsAutoPassword,
  manualPassword,
  setManualPassword,
  canWrite,
  setCanWrite,
  isTrial = false,
  setIsTrial,
  trialStartDate,
  setTrialStartDate,
  trialEndDate,
  setTrialEndDate,
  loading,
  onSubmit
}) {
  const lockedAssoc = associations.find(a => (a.groupId || a.id) === groupId);
  const lockedAssocName = lockedAssoc ? (lockedAssoc.name || lockedAssoc.nom) : groupId;

  const selectableAssociations = associations.filter(a => {
    const gid = (a.groupId || a.id || '').toLowerCase();
    if (isTrial || role === 'pro') {
      return gid !== 'samambaia' && gid !== 'samambaia-maracatu';
    }
    return true;
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Type d'accès */}
      <div>
        <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1.5">Type de Profil à Créer</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole('mestre')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              role === 'mestre' ? 'bg-amber-100 border-[#8b4513] text-[#4a2e1b] ring-1 ring-[#8b4513]' : 'bg-white/80 border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="font-bold text-xs flex items-center gap-1">👑 Mestre Bloco</span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">Responsable officiel (Organizad'Or)</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('pro')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              role === 'pro' ? 'bg-amber-100 border-[#8b4513] text-[#4a2e1b] ring-1 ring-[#8b4513]' : 'bg-white/80 border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="font-bold text-xs flex items-center gap-1">🎭 Invité Pro</span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">Testeur / Invité (Séquenciad'Or)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">Email *</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'mestre' ? "contact@bloco.org" : "pro@musique.com"}
              className="w-full pl-9 pr-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
            {role === 'mestre' ? "Nom du Mestre / Contact" : "Nom & Prénom"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={role === 'mestre' ? "ex: Mestre Lucas" : "ex: Invité Pro"}
              className="w-full pl-9 pr-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
            />
          </div>
        </div>
      </div>

      {/* Association cible */}
      <div>
        <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">Association / Espace Cible</label>
        {lockGroup ? (
          <div className="p-2.5 bg-[#f4e8cf] rounded-lg border border-[#8b4513]/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Structure associée :</span>
              <span className="font-bold text-[#4a2e1b]">{lockedAssocName}</span>
              <code className="text-[10px] text-[#8b4513] font-mono ml-2">({groupId})</code>
            </div>
            <span className="text-xs px-2 py-0.5 bg-white/70 rounded border border-[#8b4513]/20 font-bold text-[#8b4513]">🔒 Lié</span>
          </div>
        ) : (
          <>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-bold text-[#4a2e1b] rounded border border-[#8b4513]"
            >
              {selectableAssociations.length > 0 && (
                <optgroup label="Associations disponibles">
                  {selectableAssociations.map(a => (
                    <option key={a.id} value={a.groupId || a.id}>{a.name || a.nom} ({a.groupId || a.id})</option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Espaces bac à sable">
                <option value="guest-pro">Espace Invités & Pros (guest-pro)</option>
                <option value="pif">Laboratoire Pif (pif)</option>
              </optgroup>
              <option value="custom">Saisir un identifiant bac à sable personnalisé...</option>
            </select>
            {groupId === 'custom' && (
              <input
                type="text"
                required
                value={customGroupId}
                onChange={(e) => setCustomGroupId(e.target.value)}
                placeholder="ex: trial-bloco-rio"
                className="mt-2 w-full px-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
              />
            )}
          </>
        )}
      </div>

      {/* Période d'essai Mestre (Trial) */}
      <div className="p-3 bg-white/70 rounded-lg border border-[#8b4513]/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-gray-700">Compte à l'essai (Période d'évaluation)</span>
          </div>
          <button type="button" onClick={() => setIsTrial && setIsTrial(!isTrial)} className="cursor-pointer text-[#8b4513]">
            {isTrial ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
          </button>
        </div>

        {isTrial && (
          <div className="pt-2 border-t border-gray-200/80 space-y-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">Début d'essai</label>
                <input
                  type="date"
                  value={trialStartDate}
                  onChange={(e) => setTrialStartDate && setTrialStartDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white text-[#2c1d11] text-xs rounded border border-[#8b4513]/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">Fin d'essai</label>
                <input
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate && setTrialEndDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white text-[#2c1d11] text-xs rounded border border-[#8b4513]/40"
                />
              </div>
            </div>
            <p className="text-[10px] text-amber-800 leading-tight">
              ⏳ Droits complets Cloud jusqu'à échéance. Après l'échéance : période de grâce (gel/lecture seule 60j).
            </p>
          </div>
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

      {/* Toggle Droit d'édition Séquenceur (uniquement en rôle pro) */}
      {role === 'pro' && (
        <div className="flex items-center justify-between p-2.5 bg-white/70 rounded-lg border border-[#8b4513]/20">
          <span className="text-xs font-bold text-gray-700">Droit d'édition Séquenceur (canWrite)</span>
          <button type="button" onClick={() => setCanWrite(!canWrite)} className="cursor-pointer text-[#8b4513]">
            {canWrite ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
          </button>
        </div>
      )}

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
            <span>{role === 'mestre' ? "👑 Créer le compte Mestre" : "🎭 Générer l'accès invité"}</span>
          </>
        )}
      </button>
    </form>
  );
}
