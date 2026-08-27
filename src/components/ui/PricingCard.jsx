import React from 'react';
import { Check, Sparkles, HeartHandshake, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../context/CurrencyContext';

export default function PricingCard({ plan, billingCycle, onSelect }) {
  const { t } = useLanguage();
  const { currency, symbol } = useCurrency();
  const price = billingCycle === 'annual' ? plan.pricing.annual[currency] : plan.pricing.monthly[currency];
  const monthlyEquivalent = plan.pricingMonthlyEquivalent ? plan.pricingMonthlyEquivalent[currency] : 0;
  const isAnnual = billingCycle === 'annual';

  return (
    <div
      className={`bg-white/90 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 ${
        plan.highlighted
          ? 'xilo-border ring-4 ring-[#8b4513] shadow-2xl relative scale-102 bg-[#fdf6e7]'
          : 'border-2 border-[#4a2e1b]/30 shadow-md hover:border-[#8b4513]'
      }`}
    >
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded ${
            plan.highlighted ? 'bg-[#8b4513] text-[#fdf6e7]' : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {plan.badge}
          </span>
          {plan.highlighted && <Sparkles className="w-4 h-4 text-amber-600 animate-bounce" />}
        </div>

        <h3 className="text-xl font-bold font-cordel text-[#4a2e1b] mb-1">
          {plan.name}
        </h3>
        <p className="text-xs text-[#8b4513] mb-4 min-h-[32px]">
          {plan.tagline}
        </p>

        <div className="bg-[#f4e8cf]/50 p-4 rounded-lg border border-[#8b4513]/20 text-center mb-6">
          <div className="text-3xl sm:text-4xl font-black text-[#4a2e1b] font-cordel">
            {price === 0 ? `0${symbol}` : `${symbol === 'R$' ? 'R$' : ''}${price}${symbol === '€' ? '€' : ''}`}
          </div>
          <div className="text-xs text-gray-600 font-medium mt-1">
            {price === 0
              ? 'Accès gratuit à vie'
              : isAnnual
              ? `par an (${symbol === 'R$' ? 'R$' : ''}${monthlyEquivalent}${symbol === '€' ? '€' : ''} / mois)`
              : 'par mois (sans engagement)'}
          </div>
        </div>

        <div className="text-[11px] font-bold uppercase text-[#8b4513] tracking-wider mb-3">
          Public visé : <span className="normal-case font-semibold text-[#2c1d11]">{plan.targetAudience}</span>
        </div>

        <ul className="space-y-2.5 mb-6 text-xs text-[#2c1d11]">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        <div className="mb-6 text-center">
          <a href="#triptyque" className="text-[11px] font-bold text-[#8b4513] hover:text-[#6e370f] underline underline-offset-2 transition-colors">
            Voir tous les avantages en détails
          </a>
        </div>
      </div>

      <div>
        <button
          onClick={onSelect}
          className={`w-full py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            plan.highlighted
              ? 'bg-[#8b4513] text-[#fdf6e7] hover:bg-[#6e370f]'
              : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#ebd8b3] border border-[#8b4513]/40'
          }`}
        >
          <span>{plan.ctaText}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        {(plan.id === 'association' || plan.id === 'ecosysteme') && (
          <div className="text-[10px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
            <HeartHandshake className="w-3 h-3 text-emerald-700" />
            <span>HelloAsso / Virement</span>
          </div>
        )}
      </div>
    </div>
  );
}
