import React, { useState } from 'react';
import { Copy, Check, CheckCircle2 } from 'lucide-react';

/**
 * Vue de confirmation après la création réussie d'un compte invité / pro.
 * Affiche les identifiants et permet la copie directe du message d'invitation.
 */
export default function AdminGuestSuccessView({ result, onReset, onClose }) {
  const [copied, setCopied] = useState(false);

  const getInvitationMessage = () => {
    if (!result) return '';
    const name = result.displayName || 'ami(e)';
    return `Salut ${name} ! Ton accès à O Girador est prêt :
🔗 https://sequenciador.o-girador.com
✉️ Email : ${result.email}
🔑 Mot de passe : ${result.password}
Tu as accès directement au studio et aux morceaux choisis. Amuse-toi bien avec !`;
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
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Compte créé avec succès !</span>
        </div>
        <div className="text-xs space-y-1.5 text-gray-700 bg-white/80 p-3 rounded border border-emerald-200">
          <p><strong>Nom :</strong> {result.displayName}</p>
          <p><strong>Email :</strong> <span className="font-mono text-emerald-900">{result.email}</span></p>
          <p><strong>Mot de passe :</strong> <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">{result.password}</span></p>
          <p><strong>Espace :</strong> <span className="font-mono">{result.groupId}</span></p>
        </div>
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
          Terminer
        </button>
      </div>
    </div>
  );
}
