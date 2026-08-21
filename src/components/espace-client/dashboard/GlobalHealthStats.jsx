import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, Calendar, Music, Mail, Activity, Sparkles, Globe, X, Lock } from 'lucide-react';
import EventsAnalysisModal from '../modals/EventsAnalysisModal';

export default function GlobalHealthStats({ userData, associationData }) {
  const hasPack = (packId) => {
    if (associationData?.isAdmin || associationData?.role === 'admin') return true;
    const packs = associationData?.unlockedPacks || [];
    return packs.some(p => p.includes(packId) || p.includes('ecosysteme') || p.includes('association') || p.includes('essentiel'));
  };
  const [stats, setStats] = useState({
    activeMembers: 0,
    pupitres: [],
    upcomingEvents: 0,
    nextEventName: null,
    totalRhythms: 0,
    totalChoreos: 0,
    newsletterSubscribers: 0,
    vitrineViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [isPupitreModalOpen, setIsPupitreModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userData?.groupId) {
        setLoading(false);
        return;
      }

      // Helper to swallow individual permission errors
      const safeGetDocs = async (q) => {
        try {
          return await getDocs(q);
        } catch (e) {
          if (e.code !== 'permission-denied') {
            console.warn("Info fetch:", e.message);
          }
          return null; // Return null if failed
        }
      };

      try {
        // 1. Fetch Users (Membres Actifs) + Pupitres
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('groupId', '==', userData.groupId), where('statutActuel', '==', 'active'));
        const usersSnap = await safeGetDocs(qUsers);
        
        let pupitresArray = [];
        let activeMembersCount = 0;
        if (usersSnap) {
          activeMembersCount = usersSnap.size;
          const pupitreCounts = {};
          usersSnap.forEach(docSnap => {
            const user = docSnap.data();
            if (!user) return;
            let insts = [];
            if (user.instrument) insts.push(user.instrument);
            else if (Array.isArray(user.instrumentsJoues) && user.instrumentsJoues.length > 0) insts = user.instrumentsJoues;
            
            if (insts.length > 0) {
              insts.forEach(inst => {
                if (typeof inst === 'string') {
                  const cleanInst = inst.trim();
                  pupitreCounts[cleanInst] = (pupitreCounts[cleanInst] || 0) + 1;
                }
              });
            }
          });
          
          pupitresArray = Object.keys(pupitreCounts)
            .map(name => ({ label: name, count: pupitreCounts[name] }))
            .sort((a, b) => b.count - a.count); // Keep all for modal
        }

        // 2. Fetch Events
        const eventsRef = collection(db, 'events');
        const qEvents = query(eventsRef, where('groupId', '==', userData.groupId));
        const eventsSnap = await safeGetDocs(qEvents);
        
        let upcomingEventsCount = 0;
        let nextEvent = null;
        if (eventsSnap) {
          const tzOffset = (new Date()).getTimezoneOffset() * 60000;
          const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
          const upcomingEvents = [];
          
          eventsSnap.forEach(docSnap => {
            const evt = docSnap.data();
            let dateStr = '';
            if (evt.date && typeof evt.date.toDate === 'function') {
              dateStr = evt.date.toDate().toLocaleDateString('en-CA');
            } else if (evt.date && typeof evt.date === 'string') {
              dateStr = evt.date.split('T')[0];
            } else if (evt.dateString) {
              dateStr = evt.dateString.split('T')[0];
            }
            if (dateStr && dateStr >= todayStr) {
              upcomingEvents.push({ ...evt, dateStr });
            }
          });
          
          upcomingEvents.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
          upcomingEventsCount = upcomingEvents.length;
          nextEvent = upcomingEventsCount > 0 ? (upcomingEvents[0].title || upcomingEvents[0].nom || 'Événement') : null;
        }

        // 3. Fetch Rhythms
        const rhythmsRef = collection(db, 'rhythms');
        const qRhythms = query(rhythmsRef, where('groupId', '==', userData.groupId));
        const rhythmsSnap = await safeGetDocs(qRhythms);
        const totalRhythmsCount = rhythmsSnap ? rhythmsSnap.size : 0;

        // 4. Fetch Choreographies
        const choreoRef = collection(db, 'choreographies');
        const qChoreo = query(choreoRef, where('groupId', '==', userData.groupId));
        const choreoSnap = await safeGetDocs(qChoreo);
        const totalChoreosCount = choreoSnap ? choreoSnap.size : 0;

        // 5. Fetch Newsletter Subscribers
        const newsletterRef = collection(db, 'newsletter_subscribers');
        const qNewsletter = query(newsletterRef, where('groupId', '==', userData.groupId));
        const newsletterSnap = await safeGetDocs(qNewsletter);
        const newsletterSubscribersCount = newsletterSnap ? newsletterSnap.size : 0;

        setStats({
          activeMembers: activeMembersCount,
          pupitres: pupitresArray, // Full array
          upcomingEvents: upcomingEventsCount,
          nextEventName: nextEvent,
          totalRhythms: totalRhythmsCount,
          totalChoreos: totalChoreosCount,
          newsletterSubscribers: newsletterSubscribersCount,
          vitrineViews: 142 // Hardcoded as per legacy TabAnalytics
        });
      } catch (error) {
        console.error("Erreur inattendue dans fetchStats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userData?.groupId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full h-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((g) => (
            <div key={g} className="flex flex-col gap-3">
               <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
               <div className="h-32 bg-gray-100 rounded-xl border border-gray-100"></div>
               <div className="h-32 bg-gray-100 rounded-xl border border-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statGroups = [
    {
      title: "👥 Communauté",
      items: [
        {
          label: "Membres Actifs",
          value: stats.activeMembers,
          icon: <Users className="w-5 h-5 text-blue-600" />,
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200",
          interactive: true,
          onClick: () => setIsPupitreModalOpen(true),
          secondary: stats.pupitres?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.pupitres.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 w-16">{p.label}</span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.max((p.count / Math.max(stats.activeMembers, 1)) * 100, 5)}%` }}></div>
                    </div>
                    <span className="font-bold text-gray-700 w-4 text-right">{p.count}</span>
                  </div>
                </div>
              ))}
              {stats.pupitres.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.pupitres.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : <span className="text-[10px] text-gray-400 mt-2 block">Aucun pupitre</span>
        },
        {
          label: "Abonnés Vitrine",
          value: stats.newsletterSubscribers,
          icon: <Mail className="w-5 h-5 text-indigo-600" />,
          bgColor: hasPack('essentiel') ? "bg-indigo-100" : "bg-gray-100",
          borderColor: hasPack('essentiel') ? "border-indigo-200" : "border-gray-200",
          isLocked: !hasPack('essentiel'),
          secondary: (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 flex items-center gap-1 w-max">
                <Globe className="w-3 h-3" /> {stats.vitrineViews} vues ce mois
              </span>
              {!hasPack('essentiel') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]
    },
    {
      title: "🎨 Créativité",
      items: [
        {
          label: "Rythmes Audio",
          value: stats.totalRhythms,
          icon: <Music className="w-5 h-5 text-purple-600" />,
          bgColor: hasPack('association') ? "bg-purple-100" : "bg-gray-100",
          borderColor: hasPack('association') ? "border-purple-200" : "border-gray-200",
          isLocked: !hasPack('association'),
          secondary: (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-500/80 uppercase tracking-wider block">App Séquenceur</span>
              {!hasPack('association') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        },
        {
          label: "Chorégraphies",
          value: stats.totalChoreos,
          icon: <Activity className="w-5 h-5 text-pink-600" />,
          bgColor: hasPack('ecosysteme') ? "bg-pink-100" : "bg-gray-100",
          borderColor: hasPack('ecosysteme') ? "border-pink-200" : "border-gray-200",
          isLocked: !hasPack('ecosysteme'),
          secondary: (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-pink-500/80 uppercase tracking-wider block">App Dançador</span>
              {!hasPack('ecosysteme') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]
    },
    {
      title: "📅 Activité",
      items: [
        {
          label: "Événements à venir",
          value: stats.upcomingEvents,
          icon: <Calendar className="w-5 h-5 text-emerald-600" />,
          bgColor: "bg-emerald-100",
          borderColor: "border-emerald-200",
          interactive: true,
          onClick: () => setIsEventsModalOpen(true),
          secondary: stats.nextEventName ? (
            <div className="mt-3 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1.5 rounded border border-emerald-100 line-clamp-2">
              <strong className="block text-emerald-900 mb-0.5">Prochain :</strong> 
              {stats.nextEventName}
            </div>
          ) : <span className="text-[10px] text-gray-400 mt-3 block">Aucun événement planifié</span>
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-amber-900/10 shadow-sm p-6 w-full h-full flex flex-col">
      <h3 className="font-bold text-[#4a2e1b] mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <span>Santé Globale & Hub</span>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {statGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-1">
              {group.title}
            </h4>
            <div className="flex flex-col gap-3 flex-1">
              {group.items.map((kpi, idx) => (
                <div 
                  key={idx} 
                  onClick={kpi.interactive ? kpi.onClick : undefined}
                  className={`flex flex-col justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group 
                    ${kpi.interactive ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all' : 'hover:shadow-md transition-shadow'}`}
                >
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className={kpi.isLocked ? "opacity-50" : ""}>
                      <div className="text-2xl font-black text-[#4a2e1b] mb-0.5">{kpi.isLocked ? '-' : kpi.value}</div>
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{kpi.label}</div>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${kpi.bgColor} border ${kpi.borderColor}`}>
                      {kpi.isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : kpi.icon}
                    </div>
                  </div>
                  
                  {/* Contenu secondaire */}
                  <div className="relative z-10 mt-auto border-t border-gray-50 pt-3 mt-3">
                    {kpi.secondary}
                  </div>
                  
                  {/* Background decoration */}
                  <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-[0.03] ${kpi.bgColor.replace('100', '900')} pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Répartition Pupitres */}
      {isPupitreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#4a2e1b] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Répartition par Pupitre
              </h3>
              <button 
                onClick={() => setIsPupitreModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {stats.pupitres.length > 0 ? (
                <div className="space-y-4">
                  {stats.pupitres.map((p, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-sm text-gray-700">{p.label}</span>
                        <span className="font-black text-lg text-[#4a2e1b]">{p.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.max((p.count / Math.max(stats.activeMembers, 1)) * 100, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun membre avec un pupitre assigné pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Analyse des Événements */}
      {isEventsModalOpen && (
        <EventsAnalysisModal 
          groupId={userData?.groupId} 
          onClose={() => setIsEventsModalOpen(false)} 
        />
      )}
    </div>
  );
}
