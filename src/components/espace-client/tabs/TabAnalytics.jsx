import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Users, Globe, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export default function TabAnalytics({ associationData, userData }) {
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pupitres, setPupitres] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState('...');
  
  // Sélecteur de dates pour filtrer (pour l'instant local state)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!userData?.groupId) {
        setLoading(false);
        return;
      }
      
      try {
        // 1. Récupération de tous les membres pour les effectifs et pupitres
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('groupId', '==', userData.groupId));
        const usersSnap = await getDocs(qUsers);
        
        let count = 0;
        const pupitreCounts = {};

        usersSnap.docs.forEach(doc => {
          const user = doc.data();
          count++;

          // Détection du pupitre principal via le champ 'instrument'
          let insts = [];
          if (user.instrument) {
            insts.push(user.instrument);
          } else if (Array.isArray(user.instrumentsJoues) && user.instrumentsJoues.length > 0) {
            insts = user.instrumentsJoues;
          }

          if (insts.length > 0) {
            insts.forEach(inst => {
              if (typeof inst === 'string') {
                const cleanInst = inst.trim();
                pupitreCounts[cleanInst] = (pupitreCounts[cleanInst] || 0) + 1;
              }
            });
          } else {
            pupitreCounts['Non renseigné'] = (pupitreCounts['Non renseigné'] || 0) + 1;
          }
        });

        setMemberCount(count);

        // Formater les pupitres pour l'affichage (tri par nombre décroissant)
        const pupitresArray = Object.keys(pupitreCounts).map(name => ({
          label: name,
          count: pupitreCounts[name]
        })).sort((a, b) => b.count - a.count);

        setPupitres(pupitresArray);

        // 2. Récupération des événements
        const eventsRef = collection(db, 'events');
        const qEvents = query(
          eventsRef, 
          where('groupId', '==', userData.groupId)
        );
        
        const eventsSnap = await getDocs(qEvents);
        
        // Obtenir la date d'aujourd'hui en format string AAAA-MM-JJ pour comparer avec les dates des événements
        const todayStr = new Date().toISOString().split('T')[0];
        
        const upcomingEvents = [];
        eventsSnap.forEach(docSnap => {
          const evt = docSnap.data();
          
          let dateStr = '';
          let actualDateObj = null;

          // Gérer tous les formats de date possibles dans Firebase
          if (evt.date && typeof evt.date.toDate === 'function') {
            actualDateObj = evt.date.toDate();
            // Eviter le décalage de fuseau horaire
            dateStr = actualDateObj.toLocaleDateString('en-CA'); // Format YYYY-MM-DD
          } else if (evt.date && typeof evt.date === 'string') {
            dateStr = evt.date.split('T')[0];
            actualDateObj = new Date(evt.date);
          } else if (evt.dateString) {
            dateStr = evt.dateString.split('T')[0];
            actualDateObj = new Date(evt.dateString);
          }

          if (dateStr && dateStr >= todayStr) {
            upcomingEvents.push({
              ...evt,
              normalizedDateStr: dateStr,
              actualDateObj: actualDateObj
            });
          }
        });

        setUpcomingEventsCount(upcomingEvents.length);

        // Trier pour trouver le plus proche
        upcomingEvents.sort((a, b) => {
          return a.normalizedDateStr.localeCompare(b.normalizedDateStr);
        });

        if (upcomingEvents.length > 0) {
          const eventData = upcomingEvents[0];
          setNextEvent({
            title: eventData.title || eventData.nom || 'Événement',
            date: eventData.actualDateObj,
            type: eventData.type || 'Général',
            time: eventData.time || eventData.heure || ''
          });
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des analyses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userData?.groupId]);

  const kpis = [
    {
      id: 'membres',
      label: 'Membres gérés',
      value: loading ? '...' : memberCount,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'vitrine',
      label: 'Rayonnement Vitrine',
      value: '142',
      suffix: ' vues',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'events',
      label: 'Événements',
      value: upcomingEventsCount,
      suffix: ' à venir',
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    }
  ];

  // Calcul du max pour les jauges
  const maxPupitreCount = pupitres.length > 0 ? Math.max(...pupitres.map(p => p.count)) : 1;
  const gaugeColors = ['bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* En-tête et Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#4a2e1b] font-cordel mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            L'impact de mon association
          </h2>
          <p className="text-[#8b4513]">
            Suivez l'évolution de vos effectifs et de votre agenda.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-[#fdf6e7] p-3 rounded-xl border border-amber-900/10 shadow-sm">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-amber-900/70 mb-1">Début de saison</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border-white shadow-sm focus:border-amber-500 focus:ring-0 text-[#4a2e1b]"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-amber-900/70 mb-1">Fin de saison</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border-white shadow-sm focus:border-amber-500 focus:ring-0 text-[#4a2e1b]"
            />
          </div>
        </div>
      </div>

      {/* KPIs de base */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.id} className="bg-white rounded-xl p-5 border border-amber-900/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-amber-900/5 rounded-bl-full -z-0"></div>
            
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-600">{kpi.label}</h3>
            </div>
            
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-3xl font-black text-[#4a2e1b]">{kpi.value}</span>
              {kpi.suffix && (
                <span className="text-sm font-medium text-gray-500">{kpi.suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Section Principale : Jauges et Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Répartition par Pupitre (Prend 2/3 de l'espace) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-amber-900/10 shadow-sm p-6 sm:p-8">
          <h3 className="text-xl font-bold text-[#4a2e1b] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users className="w-6 h-6 text-amber-600" />
            Répartition par Pupitre
          </h3>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg w-full"></div>
              ))}
            </div>
          ) : pupitres.length > 0 ? (
            <div className="space-y-5">
              {pupitres.map((pupitre, index) => {
                const widthPercentage = Math.max((pupitre.count / maxPupitreCount) * 100, 2);
                const colorClass = gaugeColors[index % gaugeColors.length];

                return (
                  <div key={pupitre.label} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-bold text-sm text-gray-700">{pupitre.label}</span>
                      <span className="font-black text-lg text-[#4a2e1b]">{pupitre.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                        style={{ width: `${widthPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Aucun pupitre assigné pour le moment.</p>
            </div>
          )}
        </div>

        {/* Prochain Événement (Prend 1/3 de l'espace) */}
        <div className="bg-gradient-to-br from-[#8b4513] to-[#6e370f] rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <h3 className="text-amber-200 font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2 relative z-10">
            <Calendar className="w-4 h-4" />
            Prochain Événement
          </h3>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-white/20 rounded w-1/3"></div>
                <div className="h-8 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            ) : nextEvent ? (
              <>
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide">
                    {nextEvent.type}
                  </span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-black font-cordel mb-4 leading-tight">
                  {nextEvent.title}
                </h4>
                <div className="space-y-2 text-amber-100">
                  <p className="flex items-center gap-2 font-medium capitalize">
                    <Calendar className="w-4 h-4 opacity-70" />
                    {formatDate(nextEvent.date)}
                  </p>
                  {nextEvent.time && (
                    <p className="flex items-center gap-2 font-medium">
                      <span className="w-4 h-4 inline-flex items-center justify-center opacity-70">⌚</span>
                      {nextEvent.time}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-amber-200/80 font-medium">Aucun événement planifié prochainement.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
