/**
 * Modale de navette éditoriale permettant à l'administrateur de demander
 * des ajustements bienveillants ou de suggérer un surclassement de palier d'Axé.
 */

import React, { useState } from 'react';
import { X, SendHorizontal, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const REASON_CATEGORIES = [
  { id: 'incomplete_technical', label: 'Précisions techniques manquantes', placeholder: 'Indiquez les instruments, tempos ou repères manquants...' },
  { id: 'cultural_ref', label: 'Références culturelles / historiques à vérifier', placeholder: 'Précisez le contexte traditionnel, lignée ou origine culturelle...' },
  { id: 'upgrade_eligible', label: 'Éligible à un palier supérieur', placeholder: 'Félicitez le Mestre et proposez le surclassement de palier mérité...' },
  { id: 'audio_quality', label: 'Rendu audio ou calage rythmique perfectible', placeholder: 'Décrivez les retouches de mixage ou d\'enregistrement recommandées...' }
];

const SUGGESTED_TIERS = [
  { id: 'lutherie', label: 'Lutherie (15 Axé - prime 20)' },
  { id: 'sequence', label: 'Séquence (20 Axé - prime 25)' },
  { id: 'combo', label: 'Combo (35 Axé - prime 40)' },
  { id: 'bundle', label: 'Bundle (50 Axé - prime 60)' }
];

export default function EditorialReviewModal({ isOpen, onClose, item, onSubmit }) {
  const [reasonCategory, setReasonCategory] = useState('incomplete_technical');
  const [suggestedTier, setSuggestedTier] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const activeCategory = REASON_CATEGORIES.find(c => c.id === reasonCategory) || REASON_CATEGORIES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminMessage.trim()) {
      setError("Veuillez rédiger un message d'accompagnement pour le Mestre.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        reasonCategory,
        suggestedTier: suggestedTier || null,
        adminMessage: adminMessage.trim()
      });
      onClose();
    } catch (err) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200 animate-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="bg-[#8b4513] text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-cordel text-white">Navette Éditoriale</h3>
              <p className="text-xs text-amber-200/90 truncate max-w-xs">{item.title}</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Motif de l'ajustement
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#8b4513] outline-none"
            >
              {REASON_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Suggestion de surclassement de palier (facultatif)
            </label>
            <select
              value={suggestedTier}
              onChange={(e) => setSuggestedTier(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#8b4513] outline-none"
            >
              <option value="">Conserver le palier actuel ({item.tier || 'défaut'})</option>
              {SUGGESTED_TIERS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Message d'accompagnement pour l'auteur
            </label>
            <textarea
              rows={4}
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder={activeCategory.placeholder}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8b4513] outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
              Demander des ajustements
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
