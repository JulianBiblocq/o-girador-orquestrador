import React from 'react';
import { X, Sparkles, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function UniverseModal({ universe, onClose }) {
  if (!universe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdf6e7] xilo-border rounded-xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b4513] hover:text-[#4a2e1b] p-1 rounded-full bg-[#f4e8cf] border border-[#8b4513]/30 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700 text-white text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            {universe.badge} • Sortie Prévue {universe.teaser?.plannedRelease || 'Prochainement'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4a2e1b] font-cordel">
            {universe.name}
          </h2>
          <p className="text-sm font-medium text-[#8b4513]">
            {universe.subtitle}
          </p>
        </div>

        {/* Teaser Box */}
        <div className="bg-white/80 p-4 sm:p-5 rounded-lg border-2 border-[#8b4513]/30 space-y-3">
          <h3 className="font-bold text-[#4a2e1b] text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {universe.teaser?.title || 'Présentation de l\'Univers'}
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            {universe.teaser?.description}
          </p>
        </div>

        {/* Features preview */}
        {universe.teaser?.features && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#8b4513] uppercase tracking-wider">
              Fonctionnalités en cours de développement :
            </h4>
            <ul className="space-y-2">
              {universe.teaser.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-[#2c1d11]">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#8b4513]/20 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-gray-500 italic">
            Rejoignez la newsletter pour être notifié au lancement.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#8b4513] text-[#fdf6e7] rounded-lg font-bold text-xs hover:bg-[#6e370f] transition-all shadow cursor-pointer"
          >
            Fermer l'aperçu
          </button>
        </div>

      </div>
    </div>
  );
}
