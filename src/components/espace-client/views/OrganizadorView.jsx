import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Plus, Calendar, Edit3, ExternalLink } from 'lucide-react';
import EventsAnalysisModal from '../modals/EventsAnalysisModal';

export default function OrganizadorView({ userData, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.groupId) return;
      
      try {
        const ref = collection(db, 'events');
        const q = query(ref, where('groupId', '==', userData.groupId));
        const snap = await getDocs(q);
        
        const todayStr = new Date().toISOString().split('T')[0];
        let docs = [];
        
        snap.forEach(docSnap => {
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
            docs.push({ id: docSnap.id, ...evt, normalizedDateStr: dateStr });
          }
        });
        
        // Tri en mémoire par date croissante (prochains événements d'abord)
        docs.sort((a, b) => a.normalizedDateStr.localeCompare(b.normalizedDateStr));
        
        setItems(docs.slice(0, 3));
      } catch (error) {
        console.error("Erreur fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData?.groupId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateStr));
  };

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
            <img src="/logos/organizador.png" alt="Organizador" className="w-8 h-8 rounded-lg" onError={(e) => e.target.style.display='none'} />
            Organizador
          </h2>
          <p className="text-[#8b4513] text-sm">Organisez les événements et l'agenda de l'association.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEventsModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-lg border border-gray-200 transition-colors shadow-sm cursor-pointer"
          >
            Ouvrir l'agenda complet
          </button>
          <a 
            href="https://organizador.o-girador.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#d2691e] hover:bg-[#b05819] text-white font-bold text-sm rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Créer un événement
            <ExternalLink className="w-3 h-3 opacity-70 ml-1" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Prochains Événements
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.title || item.nom || 'Événement'}</h4>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(item.normalizedDateStr)} {item.time || item.heure ? `- ${item.time || item.heure}` : ''}</p>
                </div>
                <button className="mt-4 flex items-center justify-center gap-1.5 w-full py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 group-hover:border-emerald-300 group-hover:text-emerald-600 transition-colors cursor-not-allowed">
                  <Edit3 className="w-3.5 h-3.5" />
                  Gérer
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">Aucun événement à venir.</p>
            <a 
              href="https://organizador.o-girador.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Planifier mon premier événement
            </a>
          </div>
        )}
      </div>

      {isEventsModalOpen && (
        <EventsAnalysisModal 
          groupId={userData?.groupId} 
          onClose={() => setIsEventsModalOpen(false)} 
        />
      )}
    </div>
  );
}
