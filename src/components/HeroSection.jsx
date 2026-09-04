import React from 'react';
import { PlayCircle, Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';
import universData from '../data/univers.json';
import { useLanguage } from '../hooks/useLanguage';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

export default function HeroSection({ activeUniverse, onNavigate }) {
  const { t } = useLanguage();
  const universeObj = universData.universes.find(u => u.id === activeUniverse) || universData.universes[0];

  const { currentUser } = useAuth();
  const [cmsMetrics, setCmsMetrics] = useState(null);
  const [launchingApp, setLaunchingApp] = useState(null);

  const handleAppLaunch = async (e, url, appKey) => {
    e.preventDefault();
    if (launchingApp) return;

    if (!currentUser || appKey === 'mostrador' || appKey === 'hub') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    setLaunchingApp(appKey);
    const newTab = window.open('', '_blank');

    try {
      const getSSOToken = httpsCallable(functions, 'getCrossAppAuthToken');
      const res = await getSSOToken();
      const customToken = res.data?.customToken;

      if (customToken) {
        const targetUrl = new URL(url);
        targetUrl.searchParams.set('ssoToken', customToken);
        if (newTab) newTab.location.href = targetUrl.toString();
        else window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      } else {
        if (newTab) newTab.location.href = url;
        else window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.warn("[Hero SSO] Erreur SSO fallback direct :", err);
      if (newTab) newTab.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setLaunchingApp(null);
    }
  };

  useEffect(() => {
    fetchHeroMetrics().then(m => {
      if (m) setCmsMetrics(m);
    });
  }, []);

  const getMetric = (key, fallbackKey) => {
    if (cmsMetrics && cmsMetrics[key]) return cmsMetrics[key];
    return t(fallbackKey).replace(/🥁|📋|🌟|👣|🎛️/g, '').trim();
  };

  return (
    <section className="relative overflow-hidden py-12 lg:py-16 paper-texture border-b-2 border-[#4a2e1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl mx-auto space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4e8cf] border-2 border-[#8b4513] text-[#8b4513] text-xs font-extrabold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#e67e22]" />
          <span>{t('hero.badge')} {universeObj.name}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#4a2e1b] tracking-tight font-cordel leading-tight">
          {t('hero.title')} <span className="text-[#8b4513]">{t('hero.titleHighlight')}</span>
        </h1>

        <p className="text-sm sm:text-base text-[#8b4513] font-medium max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#triptyque"
            className="px-6 py-3 bg-[#8b4513] text-[#fdf6e7] font-bold text-sm sm:text-base rounded-lg shadow-lg hover:bg-[#6e370f] transition-all flex items-center gap-2 border-2 border-[#4a2e1b]"
          >
            <span>{t('hero.exploreTriptyque')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#tarifs"
            className="px-6 py-3 bg-[#f4e8cf] text-[#4a2e1b] font-bold text-sm sm:text-base rounded-lg border-2 border-[#8b4513] hover:bg-[#ebd8b3] transition-all flex items-center gap-2 shadow-sm"
          >
            <span>{t('hero.discoverTarifs')}</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </a>

          <button
            onClick={() => onNavigate('tutos')}
            className="px-6 py-3 bg-white/60 text-[#8b4513] font-bold text-sm sm:text-base rounded-lg border-2 border-[#8b4513]/40 hover:bg-white hover:border-[#8b4513] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 text-[#e67e22]" />
            <span>{t('hero.watchDemos')}</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 max-w-5xl mx-auto">
          <a 
            href="https://organizador.o-girador.com" 
            onClick={(e) => handleAppLaunch(e, "https://organizador.o-girador.com", "organizador")}
            className={`p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start hover:bg-white transition-all hover:scale-105 cursor-pointer ${launchingApp === 'organizador' ? 'opacity-50 animate-pulse' : ''}`}
          >
            <img src="/logos/organizador.png" alt="Organizador" className="w-14 h-14 mb-3 object-contain drop-shadow-md" />
            <div className="text-xl font-black text-[#4a2e1b] font-cordel leading-tight">{getMetric('manager', 'hero.metrics.manager')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('managerSub', 'hero.metrics.managerSub')}</div>
          </a>
          <a href="https://mostrador.o-girador.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start hover:bg-white transition-all hover:scale-105 cursor-pointer">
            <img src="/logos/mostrador.png" alt="Mostrador" className="w-14 h-14 mb-3 object-contain drop-shadow-md rounded-full" />
            <div className="text-xl font-black text-[#d2691e] font-cordel leading-tight">{getMetric('vitrine', 'hero.metrics.vitrine')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('vitrineSub', 'hero.metrics.vitrineSub')}</div>
          </a>
          <a 
            href="https://sequenciador.o-girador.com" 
            onClick={(e) => handleAppLaunch(e, "https://sequenciador.o-girador.com", "sequenciador")}
            className={`p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start hover:bg-white transition-all hover:scale-105 cursor-pointer ${launchingApp === 'sequenciador' ? 'opacity-50 animate-pulse' : ''}`}
          >
            <img src="/logos/sequenciador.png" alt="Sequenciador" className="w-14 h-14 mb-3 object-contain drop-shadow-md" />
            <div className="text-xl font-black text-[#18181b] font-cordel leading-tight">{getMetric('sequenceur', 'hero.metrics.sequenceur')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('sequenceurSub', 'hero.metrics.sequenceurSub')}</div>
          </a>
          <a 
            href="https://dancador.o-girador.com" 
            onClick={(e) => handleAppLaunch(e, "https://dancador.o-girador.com", "dancador")}
            className={`p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start hover:bg-white transition-all hover:scale-105 cursor-pointer ${launchingApp === 'dancador' ? 'opacity-50 animate-pulse' : ''}`}
          >
            <img src="/logos/dancador.png" alt="Dançador" className="w-14 h-14 mb-3 object-contain drop-shadow-md" />
            <div className="text-xl font-black text-[#991b1b] font-cordel leading-tight">{getMetric('dancador', 'hero.metrics.dancador')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('dancadorSub', 'hero.metrics.dancadorSub')}</div>
          </a>
          <a href="https://o-girador.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start hover:bg-white transition-all hover:scale-105 cursor-pointer">
            <img src="/logo_rond.png" alt="Orquestrador" className="w-14 h-14 mb-3 object-contain drop-shadow-md rounded-full border border-[#8b4513]/20" />
            <div className="text-xl font-black text-[#8b4513] font-cordel leading-tight">{getMetric('terreiro', 'hero.metrics.terreiro')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('terreiroSub', 'hero.metrics.terreiroSub')}</div>
          </a>
        </div>

      </div>
    </section>
  );
}
