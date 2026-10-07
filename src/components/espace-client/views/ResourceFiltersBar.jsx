/**
 * Barre d'outils et de filtres pour la Banque Rythmique (ResourceFiltersBar.jsx).
 * Recherche textuelle, visibilité, sélection du pupitre et actualisation.
 */

import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { id: 'all', label: 'Tous' },
  { id: 'mine', label: 'Mes créations' },
  { id: 'group', label: 'Groupe' },
  { id: 'public', label: 'Public' }
];

export default function ResourceFiltersBar({
  searchQuery,
  onSearchChange,
  visibilityFilter,
  onVisibilityFilterChange,
  selectedInstrument,
  onInstrumentChange,
  availableInstruments = [],
  activeTab,
  onRefresh,
  isLoading
}) {
  const showInstrumentFilter = activeTab === 'patterns' || availableInstruments.length > 0;

  return (
    <div className="bg-[#1c1613] border border-[#8b4513]/40 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
      {/* Recherche textuelle en temps réel */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Rechercher dans les ${activeTab}...`}
          className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 focus:border-amber-600 rounded-lg text-sm text-[#fdf6e7] placeholder-stone-500 outline-none transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
        {/* Filtres de visibilité rapide */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onVisibilityFilterChange(opt.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                visibilityFilter === opt.id
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filtre pupitre / instrument */}
        {showInstrumentFilter && (
          <div className="relative">
            <select
              value={selectedInstrument}
              onChange={(e) => onInstrumentChange(e.target.value)}
              className="text-xs font-bold bg-stone-950 border border-stone-800 text-stone-300 rounded-lg px-2.5 py-1.5 cursor-pointer outline-none focus:border-amber-600 appearance-none pr-6"
            >
              <option value="all">Tous pupitres</option>
              {availableInstruments.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          </div>
        )}

        {/* Bouton d'actualisation manuelle */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-amber-600/50 rounded-lg text-stone-400 hover:text-amber-400 transition-all disabled:opacity-50"
          title="Actualiser la liste"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>
    </div>
  );
}
