/**
 * Modale de confirmation de suppression intégrée.
 * Respecte la charte graphique de l'application (style Cordel / thème sombre).
 */

import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = '',
  itemType = 'ce fichier audio',
  isDeleting = false
}) {
  // Gestion de la touche Échap pour fermer la modale
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => { if (!isDeleting) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div 
        className="relative w-full max-w-md bg-[#1c1613] text-[#fdf6e7] border-2 border-[#8b4513]/70 rounded-2xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#a8907a] hover:text-[#fdf6e7] hover:bg-[#2e221b] transition-colors disabled:opacity-40"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête avec badge d'alerte Cordel */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-950/70 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-modal-title" className="font-cordel text-xl md:text-2xl font-black text-[#fdf6e7]">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-[#a8907a] flex items-center gap-1.5 mt-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Action définitive et irréversible
            </p>
          </div>
        </div>

        {/* Corps du message */}
        <div className="bg-[#261d17] border border-[#543d2b]/60 rounded-xl p-4 mb-5 space-y-2 text-sm text-[#d8c7b5] leading-relaxed">
          <p>
            Voulez-vous vraiment retirer {itemType} {itemName ? (
              <span className="font-bold text-[#e89a58]">« {itemName} »</span>
            ) : null} du catalogue ?
          </p>
          <p className="text-xs text-[#a8907a]">
            Le fichier audio binaire et ses métadonnées associées seront définitivement purgés.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#3d2a1e]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#543d2b] bg-[#2a1f18] hover:bg-[#382b22] text-[#e8d7c8] font-bold text-sm transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
