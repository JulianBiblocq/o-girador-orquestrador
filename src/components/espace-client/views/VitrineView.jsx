import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Plus, Globe, Edit3, ExternalLink } from 'lucide-react';

export default function VitrineView({ userData, onBack }) {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.groupId) return;
      
      try {
        const ref = collection(db, 'announcements');
        const q = query(ref, where('groupId', '==', userData.groupId));
        const snap = await getDocs(q);
        
        let docs = [];
        snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        
        // Tri en mémoire par date décroissante
        docs.sort((a, b) => {
          const dateA = a.date?.toMillis?.() || a.createdAt?.toMillis?.() || a.date || a.createdAt || 0;
          const dateB = b.date?.toMillis?.() || b.createdAt?.toMillis?.() || b.date || b.createdAt || 0;
          return dateB - dateA;
        });
        
        setItems(docs.slice(0, 3));

        // Fetch events for vitrine
        const eventsRef = collection(db, 'events');
        const qEvents = query(eventsRef, where('groupId', '==', userData.groupId));
        const snapEvents = await getDocs(qEvents);
        
        let eventsDocs = [];
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
        snapEvents.forEach(docSnap => {
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
            eventsDocs.push({ id: docSnap.id, ...evt, normalizedDateStr: dateStr });
          }
        });
        
        eventsDocs.sort((a, b) => a.normalizedDateStr.localeCompare(b.normalizedDateStr));
        setEvents(eventsDocs.slice(0, 3));
      } catch (error) {
        console.error("Erreur fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData?.groupId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold text-sm transition-colors w-max bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au tableau de bord
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fdf6e7] rounded-xl p-6 border border-amber-900/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[#4a2e1b] font-cordel mb-1 flex items-center gap-2">
            <img src="/logos/mostrador.png" alt="Mostrador" className="w-8 h-8 rounded-full" onError={(e) => e.target.style.display='none'} />
            Site Vitrine
          </h2>
          <p className="text-[#8b4513] text-sm">Gérez votre présence publique et vos actualités.</p>
        </div>
        <div className="flex items-center gap-3">

          <a 
            href="https://mostrador.o-girador.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#d2691e] hover:bg-[#b05819] text-white font-bold text-sm rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Rédiger une actualité
            <ExternalLink className="w-3 h-3 opacity-70 ml-1" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Globe className="w-4 h-4 text-indigo-600" />
          Actualités récentes
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.title || item.titre || 'Actualité sans titre'}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description || item.content || item.contenu || 'Aucun contenu'}</p>
                </div>
                <button className="mt-4 flex items-center justify-center gap-1.5 w-full py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors cursor-not-allowed">
                  <Edit3 className="w-3.5 h-3.5" />
                  Éditer
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">Vous n'avez pas encore publié d'actualité.</p>
            <a 
              href="https://mostrador.o-girador.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Publier ma première actualité
            </a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Globe className="w-4 h-4 text-emerald-600" />
          Événements affichés publiquement
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(item => (
              <div key={item.id} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <h4 className="font-bold text-emerald-900 line-clamp-1">{item.title || item.nom || 'Événement'}</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(item.normalizedDateStr))}
                  </p>
                </div>
                <button className="mt-4 flex items-center justify-center gap-1.5 w-full py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700 group-hover:bg-emerald-100 transition-colors cursor-not-allowed">
                  Voir sur la vitrine
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">Aucun événement à afficher publiquement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
