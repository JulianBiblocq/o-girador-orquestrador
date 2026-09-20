/**
 * Composant d'affichage de la vitrine publique des rythmes du Séquenceur.
 * Présente les morceaux publics dans une grille avec lecteur audio et lien d'ouverture.
 */

import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';

export default function SequencerPublicCatalog({ publicItems, loading, onOpenSequencer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
        <Globe className="w-4 h-4 text-blue-600" />
        Catalogue O Girador (Public)
      </h3>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : publicItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {publicItems.map((item) => (
            <div
              key={item.id}
              className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <a
                  href={getEcosystemUrl('sequenciador', `/app?loadPreset=${item.id}`)}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenSequencer(`/app?loadPreset=${item.id}`);
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors"
                  title="Ouvrir dans le séquenceur"
                >
                  {item.title}
                </a>
                <p className="text-xs text-blue-600 mt-1">Par {item.authorName}</p>
                {item.audioUrl && <audio controls src={item.audioUrl} className="w-full h-8 mt-2" />}
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href={getEcosystemUrl('sequenciador', `/app?loadPreset=${item.id}`)}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenSequencer(`/app?loadPreset=${item.id}`);
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Ouvrir
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun rythme public disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}
