/**
 * Encart pédagogique affiché en tête de l'éditeur de création lorsque
 * l'administrateur a sollicité des ajustements éditoriaux.
 */

import React from 'react';
import { MessageSquareText, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { getTierConfig, isValidTier } from '../../../utils/axeTiers.js';

const REASON_LABELS = {
  incomplete_technical: 'Précisions techniques',
  cultural_ref: 'Références culturelles',
  upgrade_eligible: 'Éligible palier supérieur',
  audio_quality: 'Qualité audio & calage'
};

export default function EditorialFeedbackBanner({ editorialReview, currentTier = 'varal' }) {
  if (!editorialReview) return null;

  const reasonLabel = REASON_LABELS[editorialReview.reasonCategory] || 'Ajustements suggérés';
  const hasUpgrade = editorialReview.suggestedTier && isValidTier(editorialReview.suggestedTier);
  const upgradeConfig = hasUpgrade ? getTierConfig(editorialReview.suggestedTier) : null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-4 md:p-5 shadow-sm space-y-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      
      {/* En-tête avec badge de catégorie */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950 font-cordel">Conseils de l'équipe éditoriale</h4>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
              {reasonLabel}
            </span>
          </div>
        </div>

        {/* Badge valorisant de surclassement de palier */}
        {hasUpgrade && upgradeConfig && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-bold shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Objectif Palier {upgradeConfig.label.split(' ')[0]} (+{upgradeConfig.initialReward} pts d'Axé)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Message bienveillant rédigé par l'admin */}
      {editorialReview.adminMessage && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200/60 text-sm text-gray-800 leading-relaxed font-medium">
          <p className="whitespace-pre-wrap">{editorialReview.adminMessage}</p>
        </div>
      )}

      {/* Message incitatif d'évolution */}
      {hasUpgrade && upgradeConfig && (
        <p className="text-xs text-amber-900/90 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            En complétant cette fiche, elle pourra passer en palier <strong>{upgradeConfig.label}</strong> ({upgradeConfig.cost} pts d'Axé à l'import, prime de <strong>{upgradeConfig.initialReward} pts</strong> pour votre association) !
          </span>
        </p>
      )}

    </div>
  );
}
