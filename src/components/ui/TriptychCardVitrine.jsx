import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { SAMAMBAIA_VITRINE_URL } from '../../constants/ecosystemUrls';

/**
 * Fiche de présentation de l'application Mostrador pour la section Triptyque.
 * Propose une présentation des atouts vitrine et un accès direct à l'exemple live de Samambaia.
 */
export default function TriptychCardVitrine() {
  const { t } = useLanguage();

  const features = [1, 2, 3, 4]
    .map(num => t(`triptyque.vitrine.feat${num}`))
    .filter(Boolean);

  return (
    <div className="bg-gradient-to-br from-[#d2691e] to-[#a04e14] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border-4 border-[#d2691e] hover:border-amber-300 transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-lg bg-white text-[#d2691e] flex items-center justify-center font-bold shadow">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-white text-[#d2691e] shadow-sm">
            {t('triptyque.vitrine.badge') || 'Rayonnement public'}
          </span>
        </div>

        <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-amber-200 transition-colors">
          {t('triptyque.vitrine.title') || 'O Girador Mostrador'}
        </h3>
        <p className="text-xs text-white/90 mb-6 leading-relaxed">
          {t('triptyque.vitrine.description')}
        </p>

        <div className="space-y-3 mb-6 text-xs">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 font-bold bg-white/20 text-white">✓</span>
              <span className="text-white/95">{feat}</span>
            </div>
          ))}
        </div>

        {/* Bouton d'action proéminent vers la vitrine réelle Samambaia */}
        <div className="mb-6 pt-2">
          <a
            href={SAMAMBAIA_VITRINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#b05819] hover:bg-amber-50 hover:text-[#8b4513] font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-2 border-white/90 cursor-pointer group/btn"
          >
            <Globe className="w-4 h-4 text-[#d2691e] group-hover/btn:rotate-12 transition-transform" />
            <span>{t('triptyque.vitrine.demoButton') || 'Découvrir un exemple live (Samambaia)'}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4 flex items-center justify-between">
        <span className="text-xs text-white/90 font-semibold flex items-center gap-1">
          {t('triptyque.vitrine.note') || 'Intégration directe Manager'}
        </span>
        <span className="text-[10px] font-mono text-white/80">Responsive & SEO</span>
      </div>
    </div>
  );
}
