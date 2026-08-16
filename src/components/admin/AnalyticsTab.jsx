import React, { useState, useEffect } from 'react';
import { getTelemetryMetrics, getSystemErrors } from '../../services/telemetryService';
import { useLanguage } from '../../hooks/useLanguage';

export default function AnalyticsTab() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState({
    activeAssociationsCount: 0,
    totalEvents: 0,
    eventsCount24h: 0,
    topFeatures: [],
    connectionsCount: 0,
    avgTimeSpent: "0m 00s",
    demographics: {
      ageGroups: [],
      gender: [],
      countries: []
    }
  });
  const [stabilityRate, setStabilityRate] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getTelemetryMetrics(30);
      setMetrics(data);

      const errors = await getSystemErrors();
      const errors24h = errors.filter(e => {
        const ts = e.timestamp?.toDate ? e.timestamp.toDate() : e.timestamp;
        return (new Date() - ts) < 24 * 60 * 60 * 1000;
      }).length;

      const rate = data.eventsCount24h > 0 
        ? Math.max(0, 100 - (errors24h / data.eventsCount24h) * 100) 
        : (errors24h > 0 ? 0 : 100);

      setStabilityRate(rate.toFixed(2));
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#4a2e1b] font-medium tracking-widest uppercase text-sm animate-pulse">Chargement des analytiques...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#4a2e1b] to-[#8b4513] text-[#fdf6e7] p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">Stabilité Système (24h)</h3>
            <div className="mt-2 text-4xl font-black">{stabilityRate}%</div>
            <p className="mt-1 text-sm opacity-90 text-green-200 font-medium">Session sans crash</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10 text-9xl group-hover:scale-110 transition-transform">🛡️</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#4a2e1b]/5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connexions (24h)</h3>
            <div className="mt-2 text-4xl font-black text-[#4a2e1b]">{metrics.connectionsCount || 0}</div>
            <p className="mt-1 text-sm text-green-600 font-medium">+12% vs hier</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-5 text-9xl group-hover:scale-110 transition-transform">🔌</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#4a2e1b]/5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temps Moyen Passé</h3>
            <div className="mt-2 text-4xl font-black text-[#4a2e1b]">{metrics.avgTimeSpent || "0m"}</div>
            <p className="mt-1 text-sm text-gray-500 font-medium">Par session active</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-5 text-9xl group-hover:scale-110 transition-transform">⏱️</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#4a2e1b]/5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assoc. Actives</h3>
            <div className="mt-2 text-4xl font-black text-[#4a2e1b]">{metrics.activeAssociationsCount}</div>
            <p className="mt-1 text-sm text-gray-500 font-medium">Sur les 30 derniers jours</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-5 text-9xl group-hover:scale-110 transition-transform">👥</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Features Histogram */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-[#4a2e1b]/5 flex flex-col h-full">
          <h3 className="text-xl font-black text-[#4a2e1b] mb-6 flex items-center gap-2">
            <span>📊</span> Top 10 Fonctionnalités
          </h3>
          
          {metrics.topFeatures.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 italic">Aucune donnée disponible.</p>
            </div>
          ) : (
            <div className="space-y-5 flex-1">
              {metrics.topFeatures.map((feat, idx) => {
                const maxCount = metrics.topFeatures[0].count;
                const percentage = Math.round((feat.count / maxCount) * 100);
                
                return (
                  <div key={idx} className="flex items-center group">
                    <div className="w-1/3 text-sm font-bold text-gray-700 truncate pr-4 flex flex-col">
                      <span className="text-[10px] uppercase text-[#8b4513] tracking-widest">{feat.appId}</span>
                      <span className="truncate">{feat.eventName}</span>
                    </div>
                    <div className="w-2/3 flex items-center">
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
                        <div 
                          className="bg-gradient-to-r from-[#8b4513] to-[#d2691e] h-3 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm font-black text-[#4a2e1b] w-12 text-right">{feat.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Demographics / Audience */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-[#4a2e1b]/5 flex flex-col h-full">
          <h3 className="text-xl font-black text-[#4a2e1b] mb-8 flex items-center gap-2">
            <span>🌍</span> Audience & Démographie
          </h3>
          
          <div className="space-y-8 flex-1">
            {/* Age */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Tranche d'âge</h4>
              <div className="flex w-full h-4 rounded-full overflow-hidden gap-0.5">
                {metrics.demographics?.ageGroups?.map((age, i) => {
                  const colors = ['bg-[#4a2e1b]', 'bg-[#8b4513]', 'bg-[#cd853f]', 'bg-[#deb887]'];
                  return (
                    <div 
                      key={i} 
                      className={`${colors[i % colors.length]} h-full transition-all duration-500 hover:brightness-110 cursor-pointer relative group`}
                      style={{ width: `${age.percentage}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {age.label} ({age.percentage}%)
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 px-1">
                {metrics.demographics?.ageGroups?.map((age, i) => (
                  <div key={i} className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${['bg-[#4a2e1b]', 'bg-[#8b4513]', 'bg-[#cd853f]', 'bg-[#deb887]'][i % 4]}`}></div>
                    {age.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Genre</h4>
              <div className="space-y-3">
                {metrics.demographics?.gender?.map((g, i) => (
                  <div key={i} className="flex items-center text-sm group cursor-pointer">
                    <span className="w-20 font-bold text-[#4a2e1b]">{g.label}</span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden mx-4">
                      <div className="bg-[#8b4513] h-full rounded-full transition-all duration-1000 group-hover:brightness-110" style={{ width: `${g.percentage}%` }}></div>
                    </div>
                    <span className="w-10 text-right font-bold text-gray-600">{g.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Top Pays</h4>
              <div className="grid grid-cols-3 gap-4">
                {metrics.demographics?.countries?.map((c, i) => (
                  <div key={i} className="bg-[#fdf6e7] p-3 rounded-xl border border-[#4a2e1b]/10 text-center hover:scale-[1.05] transition-transform cursor-default">
                    <div className="text-2xl mb-1">{c.label === 'France' ? '🇫🇷' : c.label === 'Belgique' ? '🇧🇪' : c.label === 'Suisse' ? '🇨🇭' : '🌍'}</div>
                    <div className="text-xs font-bold text-[#4a2e1b] truncate">{c.label}</div>
                    <div className="text-sm font-black text-[#8b4513]">{c.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

