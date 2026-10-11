import React, { useState } from 'react';
import { Copy, Check, CheckCircle2, ExternalLink } from 'lucide-react';

/**
 * Vue de confirmation après la création réussie d'un compte Mestre ou Pro.
 * Affiche les identifiants et permet la copie directe du message d'invitation préformaté.
 */
export default function AdminGuestSuccessView({ result, onReset, onClose }) {
  const [copied, setCopied] = useState(false);

  const isMestre = result?.role === 'mestre';
  const loginUrl = result?.loginUrl || (isMestre ? 'https://organizador.o-girador.com' : 'https://sequenciador.o-girador.com');

  const getInvitationMessage = () => {
    if (!result) return '';
    if (result.inviteMessage) return result.inviteMessage;
    const name = result.displayName || 'ami(e)';
    const assoc = result.assocName || result.groupId || 'ton association';
    return isMestre
      ? `Bonjour ${name} ! Ton espace ${assoc} est prêt sur O Girador. Connecte-toi sur ${loginUrl} avec l'email ${result.email} et le mot de passe ${result.password}.`
      : `Salut ${name} ! Ton accès invité à O Girador est prêt : ${loginUrl} avec l'email ${result.email} et le mot de passe ${result.password}.`;
  };

  const handleCopyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(getInvitationMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erreur copie presse-papier :', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 border-2 border-emerald-600/40 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-emerald-800 font-bold text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{isMestre ? 'Compte Mestre Officiel Créé !' : 'Accès Invité Pro Créé !'}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black">
            {isMestre ? '👑 MESTRE' : '🎭 PRO'}
          </span>
        </div>

        <div className="text-xs space-y-1.5 text-gray-700 bg-white/90 p-3 rounded-lg border border-emerald-200">
          <p><strong>Titulaire :</strong> {result.displayName}</p>
          <p><strong>Email :</strong> <span className="font-mono text-emerald-900 font-semibold">{result.email}</span></p>
          <p><strong>Mot de passe :</strong> <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">{result.password}</span></p>
          <p><strong>Espace Bloco :</strong> <span className="font-mono font-bold">{result.assocName || result.groupId}</span> <code className="text-[10px] text-gray-500">({result.groupId})</code></p>
          <p className="pt-1 flex items-center gap-1.5">
            <strong>Portail de connexion :</strong>
            <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="text-[#8b4513] hover:underline font-mono inline-flex items-center gap-1">
              {loginUrl} <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Aperçu du message à transmettre */}
      <div className="p-3 bg-[#fdf6e7] rounded-lg border border-[#8b4513]/20 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b4513] block">
          Message d'invitation préformaté :
        </span>
        <p className="text-xs text-gray-800 italic leading-relaxed">
          "{getInvitationMessage()}"
        </p>
      </div>

      <button
        onClick={handleCopyInvitation}
        className="w-full py-3 bg-[#8b4513] hover:bg-[#6e370f] text-[#fdf6e7] font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-2 cursor-pointer border border-[#4a2e1b]"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? 'Message copié dans le presse-papier !' : "Copier l'invitation (WhatsApp / SMS / Email)"}</span>
      </button>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onReset}
          className="flex-1 py-2 bg-[#f4e8cf] hover:bg-[#ebd8b3] text-[#4a2e1b] font-bold text-xs rounded-lg border border-[#8b4513]/40 cursor-pointer"
        >
          + Créer un autre accès
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
