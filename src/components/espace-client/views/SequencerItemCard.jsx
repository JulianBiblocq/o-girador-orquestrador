/**
 * Composant de carte pour un morceau du catalogue privé du Séquenceur.
 * Affiche le titre, le tempo, les options de réorganisation, de partage et de suppression.
 */

import React from 'react';
import { ArrowUp, ArrowDown, Check, Link as LinkIcon, Trash2 } from 'lucide-react';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';

export default function SequencerItemCard({
  item,
  index,
  totalItems,
  copiedId,
  onOpenSequencer,
  onMove,
  onShare,
  onDelete
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between hover:shadow-md transition-shadow group gap-4">
      <div className="flex-1 min-w-0">
        {item.source === 'firestore' ? (
          <a
            href={getEcosystemUrl('sequenciador', `/app?loadPreset=${item.id}`)}
            onClick={(e) => {
              e.preventDefault();
              onOpenSequencer(`/app?loadPreset=${item.id}`);
            }}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-gray-800 line-clamp-1 hover:text-[#d2691e] transition-colors"
            title="Ouvrir dans le séquenceur"
          >
            {item.title}
          </a>
        ) : (
          <h4 className="font-bold text-gray-800 line-clamp-1">{item.title}</h4>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {item.tempo ? `${item.tempo} BPM` : 'Tempo par défaut'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Boutons de réorganisation dans la liste */}
        <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
            title="Monter"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(index, 1)}
            disabled={index === totalItems - 1}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
            title="Descendre"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Actions de partage et de suppression */}
        <div className="flex gap-2">
          <button
            onClick={() => onShare(item.id)}
            className="flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-[#d2691e] hover:border-[#d2691e] transition-colors"
            title="Partager le rythme"
          >
            {copiedId === item.id ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
