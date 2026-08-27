import React, { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { fetchHeroMetrics, saveHeroMetrics, fetchPricingPlans, savePricingPlans } from '../../services/cmsService';
import tarifsData from '../../data/tarifs.json';

const DEFAULT_METRICS = {
  sequenceur: "Sequenciador",
  sequenceurSub: "Micro-timing, Tone.js & Toadas",
  manager: "Organizador",
  managerSub: "Agenda, Trésorerie & Varal",
  vitrine: "Mostrador",
  vitrineSub: "Identité Cordel & Recrutement",
  dancador: "Dançador",
  dancadorSub: "Chorégraphies & Formations"
};

export default function CmsManagerTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // States for Hero Metrics
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);

  // States for Pricing Plans
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const m = await fetchHeroMetrics();
      if (m) setMetrics(m);
      
      const p = await fetchPricingPlans();
      if (p) setPlans(p);
      
      setLoading(false);
    };
    loadData();
  }, []);

  const handleMetricChange = (key, value) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handlePlanChange = (index, field, value) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');
    
    const s1 = await saveHeroMetrics(metrics);
    const s2 = await savePricingPlans(plans);
    
    if (s1 && s2) {
      setMessage('Modifications enregistrées avec succès ! Elles sont désormais visibles sur la page publique.');
      setTimeout(() => setMessage(''), 5000);
    } else {
      setMessage('Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  const handleResetPlans = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser les forfaits avec les valeurs par défaut ?")) {
      setPlans(JSON.parse(JSON.stringify(tarifsData.plans)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-amber-800">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white/90 xilo-border rounded-xl p-6 shadow-xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#8b4513]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold font-cordel text-[#4a2e1b]">Gestion du Contenu Public</h2>
          <p className="text-xs text-gray-600 mt-1">
            Modifiez ici les textes affichés sur la page d'accueil (blocs applications et forfaits tarifaires).
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 bg-[#8b4513] text-[#fdf6e7] rounded font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#6e370f] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer tout
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 border-2 border-green-300 rounded font-bold text-sm text-center">
          {message}
        </div>
      )}

      {/* --- Section Hero Metrics --- */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-[#4a2e1b] flex items-center gap-2">
          <span>1. Blocs Applications (Section Accueil)</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Sequenciador */}
          <div className="p-4 bg-[#fdf6e7] border-2 border-[#8b4513]/40 rounded-lg space-y-3">
            <div className="flex justify-center"><img src="/logos/sequenciador.png" alt="Sequenciador" className="w-10 h-10 object-contain drop-shadow-md" /></div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Titre</label>
              <input 
                type="text" 
                value={metrics.sequenceur} 
                onChange={e => handleMetricChange('sequenceur', e.target.value)}
                className="w-full p-2 text-sm border border-[#8b4513]/40 rounded bg-white text-[#4a2e1b] font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sous-texte</label>
              <input 
                type="text" 
                value={metrics.sequenceurSub} 
                onChange={e => handleMetricChange('sequenceurSub', e.target.value)}
                className="w-full p-2 text-xs border border-[#8b4513]/40 rounded bg-white text-gray-700"
              />
            </div>
          </div>

          {/* Organizador */}
          <div className="p-4 bg-[#fdf6e7] border-2 border-[#8b4513]/40 rounded-lg space-y-3">
            <div className="flex justify-center"><img src="/logos/organizador.png" alt="Organizador" className="w-10 h-10 object-contain drop-shadow-md" /></div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Titre</label>
              <input 
                type="text" 
                value={metrics.manager} 
                onChange={e => handleMetricChange('manager', e.target.value)}
                className="w-full p-2 text-sm border border-[#8b4513]/40 rounded bg-white text-[#4a2e1b] font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sous-texte</label>
              <input 
                type="text" 
                value={metrics.managerSub} 
                onChange={e => handleMetricChange('managerSub', e.target.value)}
                className="w-full p-2 text-xs border border-[#8b4513]/40 rounded bg-white text-gray-700"
              />
            </div>
          </div>

          {/* Mostrador */}
          <div className="p-4 bg-[#fdf6e7] border-2 border-[#8b4513]/40 rounded-lg space-y-3">
            <div className="flex justify-center"><img src="/logos/mostrador.png" alt="Mostrador" className="w-10 h-10 object-contain drop-shadow-md rounded-full" /></div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Titre</label>
              <input 
                type="text" 
                value={metrics.vitrine} 
                onChange={e => handleMetricChange('vitrine', e.target.value)}
                className="w-full p-2 text-sm border border-[#8b4513]/40 rounded bg-white text-[#4a2e1b] font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sous-texte</label>
              <input 
                type="text" 
                value={metrics.vitrineSub} 
                onChange={e => handleMetricChange('vitrineSub', e.target.value)}
                className="w-full p-2 text-xs border border-[#8b4513]/40 rounded bg-white text-gray-700"
              />
            </div>
          </div>

          {/* Dançador */}
          <div className="p-4 bg-[#fdf6e7] border-2 border-[#8b4513]/40 rounded-lg space-y-3">
            <div className="flex justify-center"><img src="/logos/dancador.png" alt="Dançador" className="w-10 h-10 object-contain drop-shadow-md" /></div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Titre</label>
              <input 
                type="text" 
                value={metrics.dancador} 
                onChange={e => handleMetricChange('dancador', e.target.value)}
                className="w-full p-2 text-sm border border-[#8b4513]/40 rounded bg-white text-[#4a2e1b] font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sous-texte</label>
              <input 
                type="text" 
                value={metrics.dancadorSub} 
                onChange={e => handleMetricChange('dancadorSub', e.target.value)}
                className="w-full p-2 text-xs border border-[#8b4513]/40 rounded bg-white text-gray-700"
              />
            </div>
          </div>

        </div>
      </div>

      <hr className="border-[#8b4513]/20" />

      {/* --- Section Pricing Plans --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-[#4a2e1b]">
            2. Forfaits & Tarifs
          </h3>
          <button 
            onClick={handleResetPlans}
            className="text-[10px] uppercase font-bold text-red-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Réinitialiser aux valeurs par défaut
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((plan, index) => (
            <div key={plan.id} className="p-4 bg-white border-2 border-gray-200 rounded-lg space-y-3 shadow-sm relative">
              {plan.highlighted && <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[9px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">MIS EN AVANT</div>}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Nom du forfait</label>
                  <input 
                    type="text" 
                    value={plan.name} 
                    onChange={e => handlePlanChange(index, 'name', e.target.value)}
                    className="w-full p-2 text-sm border rounded bg-gray-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Badge (ex: Gratuit, Populaire)</label>
                  <input 
                    type="text" 
                    value={plan.badge || ''} 
                    onChange={e => handlePlanChange(index, 'badge', e.target.value)}
                    className="w-full p-2 text-sm border rounded bg-gray-50 text-amber-700 font-bold"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sous-titre court (tagline)</label>
                <input 
                  type="text" 
                  value={plan.tagline} 
                  onChange={e => handlePlanChange(index, 'tagline', e.target.value)}
                  className="w-full p-2 text-xs border rounded bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Prix Mensuel (€)</label>
                  <input 
                    type="number" 
                    value={plan.pricing.monthly?.EUR ?? plan.pricing.monthly} 
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      const newPricing = { 
                        ...plan.pricing, 
                        monthly: { ...(plan.pricing.monthly || {}), EUR: val } 
                      };
                      handlePlanChange(index, 'pricing', newPricing);
                    }}
                    className="w-full p-2 text-sm border rounded bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Prix Mensuel (R$)</label>
                  <input 
                    type="number" 
                    value={plan.pricing.monthly?.BRL ?? 0} 
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      const newPricing = { 
                        ...plan.pricing, 
                        monthly: { ...(plan.pricing.monthly || {}), BRL: val } 
                      };
                      handlePlanChange(index, 'pricing', newPricing);
                    }}
                    className="w-full p-2 text-sm border rounded bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Prix Annuel (€)</label>
                  <input 
                    type="number" 
                    value={plan.pricing.annual?.EUR ?? plan.pricing.annual} 
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      const newPricing = { 
                        ...plan.pricing, 
                        annual: { ...(plan.pricing.annual || {}), EUR: val } 
                      };
                      handlePlanChange(index, 'pricing', newPricing);
                    }}
                    className="w-full p-2 text-sm border rounded bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Prix Annuel (R$)</label>
                  <input 
                    type="number" 
                    value={plan.pricing.annual?.BRL ?? 0} 
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      const newPricing = { 
                        ...plan.pricing, 
                        annual: { ...(plan.pricing.annual || {}), BRL: val } 
                      };
                      handlePlanChange(index, 'pricing', newPricing);
                    }}
                    className="w-full p-2 text-sm border rounded bg-gray-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Cible (public visé)</label>
                <input 
                  type="text" 
                  value={plan.targetAudience} 
                  onChange={e => handlePlanChange(index, 'targetAudience', e.target.value)}
                  className="w-full p-2 text-xs border rounded bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Texte du bouton Call to action</label>
                <input 
                  type="text" 
                  value={plan.ctaText} 
                  onChange={e => handlePlanChange(index, 'ctaText', e.target.value)}
                  className="w-full p-2 text-xs border rounded bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Est mis en avant ? (Grossit la carte)
                </label>
                <select
                  value={plan.highlighted ? 'yes' : 'no'}
                  onChange={e => handlePlanChange(index, 'highlighted', e.target.value === 'yes')}
                  className="w-full p-2 text-xs border rounded bg-gray-50"
                >
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
