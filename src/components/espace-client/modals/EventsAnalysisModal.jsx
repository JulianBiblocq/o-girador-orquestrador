import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Loader2, AlertCircle, TrendingUp, History } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const getTypeColor = (type) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('prestation') || t.includes('concert')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (t.includes('répétition') || t.includes('repetition') || t.includes('ensaio')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (t.includes('réunion') || t.includes('reunion') || t.includes('ag')) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (t.includes('atelier') || t.includes('workshop')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function EventsAnalysisModal({ groupId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [typeCounts, setTypeCounts] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      if (!groupId) return;
      setLoading(true);
      
      try {
        const eventsRef = collection(db, 'events');
        // Simple query without compound index ordering
        const qEvents = query(eventsRef, where('groupId', '==', groupId));
        const eventsSnap = await getDocs(qEvents);
        
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
        const upcoming = [];
        const past = [];
        const counts = {};

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
          
          const eventItem = { ...evt, id: docSnap.id, normalizedDateStr: dateStr };
          
          if (dateStr) {
            if (dateStr >= todayStr) {
              upcoming.push(eventItem);
            } else {
              past.push(eventItem);
            }
          }

          // Comptage par type
          const tType = evt.type || 'Autre';
          counts[tType] = (counts[tType] || 0) + 1;
        });

        // Tri local
        upcoming.sort((a, b) => a.normalizedDateStr.localeCompare(b.normalizedDateStr));
        past.sort((a, b) => b.normalizedDateStr.localeCompare(a.normalizedDateStr)); // Descending pour le passé

        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setTypeCounts(counts);

      } catch (error) {
        console.error("Erreur lors de l'analyse des événements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [groupId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#fdf6e7]">
          <h2 className="text-xl font-black font-cordel text-[#4a2e1b] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Analyse de la Saison (Agenda)
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer bg-white shadow-sm border border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {loading ? (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-600">Aucun événement</h3>
              <p className="text-gray-500 text-sm mt-1">Aucun événement n'est enregistré pour cette association.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Vue Globale (Types) */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Bilan des activités
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div key={type} className={`px-3 py-1.5 rounded-lg border font-bold text-sm flex items-center gap-2 ${getTypeColor(type)}`}>
                      <span className="text-xs uppercase tracking-wide opacity-80">{type}</span>
                      <span className="bg-white/50 px-2 py-0.5 rounded-md text-base">{count}</span>
                    </div>
                  ))}
                  <div className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-bold text-sm flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide opacity-80">Total</span>
                    <span className="bg-white px-2 py-0.5 rounded-md text-base shadow-sm">{upcomingEvents.length + pastEvents.length}</span>
                  </div>
                </div>
              </div>

              {/* Colonnes Prochainement & Historique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Prochainement */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    <Calendar className="w-4 h-4" /> Prochainement ({upcomingEvents.length})
                  </h3>
                  
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.map(evt => (
                        <a 
                          key={evt.id} 
                          href="https://organizador.o-girador.com" 
                          target="_blank" 
                          rel="noreferrer"
                          className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
                        >
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${getTypeColor(evt.type).split(' ')[0]}`}></div>
                          <div className="flex justify-between items-start pl-2">
                            <div>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getTypeColor(evt.type)}`}>
                                {evt.type || 'Événement'}
                              </span>
                              <h4 className="font-bold text-[#4a2e1b] mt-1.5 group-hover:text-emerald-700 transition-colors">
                                {evt.title || evt.titre || evt.nom || evt.name || evt.eventName || 'Événement'}
                              </h4>
                              {evt.location && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {evt.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-black text-emerald-700 text-sm">{formatDate(evt.normalizedDateStr)}</div>
                              {evt.time && <div className="text-xs text-gray-500 font-mono mt-0.5">{evt.time}</div>}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                      Aucun événement à venir.
                    </div>
                  )}
                </div>

                {/* Historique */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2 bg-gray-100 p-2.5 rounded-lg border border-gray-200">
                    <History className="w-4 h-4" /> Historique ({pastEvents.length})
                  </h3>
                  
                  {pastEvents.length > 0 ? (
                    <div className="space-y-3 opacity-75 hover:opacity-100 transition-opacity">
                      {pastEvents.map(evt => (
                        <a 
                          key={evt.id}
                          href="https://organizador.o-girador.com"
                          target="_blank"
                          rel="noreferrer"
                          className="block bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-700 text-sm group-hover:text-emerald-700 transition-colors">
                                {evt.title || evt.titre || evt.nom || evt.name || evt.eventName || 'Événement'}
                              </h4>
                              <span className="text-[10px] text-gray-500 mt-0.5 block">{evt.type || 'Événement'}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-500 text-xs">{formatDate(evt.normalizedDateStr)}</div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                      Aucun historique disponible.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
