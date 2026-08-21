import React, { useState, useEffect } from 'react';
import { Globe2, MapPin } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import WorldMapNetwork from './ui/WorldMapNetwork';

export default function PublicNetworkSection({ onNavigate }) {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicAssociations = async () => {
      try {
        const ref = collection(db, 'associations');
        const snap = await getDocs(ref);
        
        let docs = [];
        snap.forEach(doc => {
          const data = doc.data();
          // N'inclure que les associations visibles et possédant des coordonnées géographiques
          if (data.isPublicInTerreiro !== false && data.location?.lat && data.location?.lng) {
            docs.push({ id: doc.id, ...data });
          }
        });
        
        setAssociations(docs);
      } catch (error) {
        console.error("Erreur récupération des associations pour la carte publique:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicAssociations();
  }, []);

  const handleJoinClick = () => {
    window.location.hash = '#inscription-gratuite';
    onNavigate('free-signup');
  };

  return (
    <section className="py-24 bg-[#4a2e1b] relative overflow-hidden">
      {/* Texture de fond */}
      <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-full mb-4">
            <Globe2 className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-cordel text-[#fdf6e7] mb-4">
            La communauté O Girador dans le monde
          </h2>
          <p className="text-amber-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Découvrez les dizaines de groupes de Maracatu, Samba et Capoeira qui utilisent déjà notre écosystème pour organiser, créer et partager leur culture.
          </p>
        </div>

        {/* Map Container */}
        <div className="bg-[#fdf6e7] p-2 md:p-4 rounded-2xl shadow-2xl border border-amber-900/30">
          {loading ? (
            <div className="w-full h-80 md:h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
              <Globe2 className="w-12 h-12 text-gray-400 opacity-50" />
            </div>
          ) : (
            <WorldMapNetwork associations={associations} />
          )}
        </div>

        {/* Lead Magnet CTA */}
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <p className="text-amber-100 mb-6 max-w-lg">
            Votre groupe n'y est pas encore ? Rejoignez le réseau mondial et gagnez en visibilité auprès de la communauté.
          </p>
          <button
            onClick={handleJoinClick}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-[#4a2e1b] px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <MapPin className="w-6 h-6" />
            Ajoutez votre groupe gratuitement
          </button>
        </div>

      </div>
    </section>
  );
}
