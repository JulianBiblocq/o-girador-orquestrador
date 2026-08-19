import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import tarifsData from '../data/tarifs.json';
import PricingCard from './ui/PricingCard';
import SynergySpotlight from './ui/SynergySpotlight';
import { useLanguage } from '../hooks/useLanguage';
import { fetchPricingPlans } from '../services/cmsService';
import { useEffect } from 'react';

export default function PricingSynergySection({ onSelectPlan }) {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState(tarifsData.billingConfig.defaultBillingCycle);
  const [cmsPlans, setCmsPlans] = useState([]);

  useEffect(() => {
    fetchPricingPlans().then(p => {
      if (p && p.length > 0) setCmsPlans(p);
      else setCmsPlans(tarifsData.plans);
    });
  }, []);

  return (
    <section id="tarifs" className="py-16 sm:py-20 paper-texture border-b-2 border-[#4a2e1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b4513] text-[#fdf6e7] text-xs font-bold uppercase tracking-wider rounded">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {t('tarifs.badge')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#4a2e1b] font-cordel">
            {t('tarifs.title')}
          </h2>
          <p className="text-xs sm:text-base text-[#8b4513] font-medium">
            {t('tarifs.subtitle')}
          </p>

          {/* Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="bg-[#f4e8cf] p-1.5 rounded-xl border-2 border-[#8b4513] flex items-center gap-2 shadow-inner">
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  billingCycle === 'annual' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'text-[#4a2e1b]'
                }`}
              >
                <span>{t('tarifs.annual')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-amber-400 text-amber-950">
                  {t('tarifs.annualBadge')}
                </span>
              </button>

              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'text-[#4a2e1b]'
                }`}
              >
                <span>{t('tarifs.monthly')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid of Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {cmsPlans.map((plan) => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              billingCycle={billingCycle} 
              onSelect={() => onSelectPlan && onSelectPlan(plan)}
            />
          ))}
        </div>

        {/* Synergy Spotlight Card */}
        <SynergySpotlight />

      </div>
    </section>
  );
}
