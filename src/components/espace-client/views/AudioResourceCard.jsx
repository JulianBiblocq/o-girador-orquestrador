/**
 * Carte Ressource Cordel (AudioResourceCard.jsx).
 * Affiche un document Firestore (preset, section, pattern) avec pré-écoute instantanée,
 * édition en ligne du titre, sélecteur de visibilité et ouverture SSO vers Séquenciad'Or.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Pencil, Trash2 } from 'lucide-react';
import { useAudioPreview } from './AudioPreviewContext.jsx';
import { launchCrossApp } from '../../../utils/crossAppAuth';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';

const VISIBILITY_CONFIG = {
  private: { label: 'Privé', badgeClass: 'bg-stone-800 text-stone-300 border-stone-700' },
  mestre_group: { label: 'Groupe', badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' },
  public: { label: 'Public', badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/50' }
};

export default function AudioResourceCard({
  item,
  type = 'presets',
  onRename,
  onVisibilityChange,
  onRequestDelete
}) {
  const { currentId, isPlaying, audioProgress, togglePlay } = useAudioPreview();
  const isCurrent = currentId === item.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const [isEditing, setIsEditing] = useState(false);
  const currentTitle = item.name || item.title || 'Sans titre';
  const [titleInput, setTitleInput] = useState(currentTitle);
  const inputRef = useRef(null);

  useEffect(() => {
    setTitleInput(item.name || item.title || 'Sans titre');
  }, [item.name, item.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveRename = async () => {
    setIsEditing(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== currentTitle && onRename) {
      try {
        await onRename(item.id, trimmed);
      } catch (_) {
        setTitleInput(currentTitle);
      }
    } else {
      setTitleInput(currentTitle);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTitleInput(currentTitle);
    }
  };

  const handleOpenInSequencer = () => {
    let queryParam = `?loadPreset=${item.id}`;
    if (type === 'sections') queryParam = `?loadSection=${item.id}`;
    if (type === 'patterns') queryParam = `?editPatternId=${item.id}`;

    const targetUrl = getEcosystemUrl('sequenciador', `/${queryParam}`);
    launchCrossApp(targetUrl, { appLabel: "Séquenciad'Or", appKey: 'sequenciador' });
  };

  const currentVisibility = (item.visibility === 'public' || item.isPublic)
    ? 'public'
    : (item.visibility === 'mestre_group' ? 'mestre_group' : 'private');
  const visConfig = VISIBILITY_CONFIG[currentVisibility] || VISIBILITY_CONFIG.private;
  const instrument = item.instrument || item.pupitre || item.instrumentName;

  return (
    <div className="relative group bg-[#1c1613] border border-[#8b4513]/40 hover:border-[#c05621] rounded-xl p-3.5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between gap-3 overflow-hidden">
      {/* En-tête : Bouton lecture, titre éditable et sélecteur de visibilité */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => togglePlay(item)}
          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all shrink-0 ${
            isCurrentPlaying
              ? 'animate-pulse border-amber-600 bg-amber-950/80 text-amber-400'
              : 'border-[#8b4513]/60 bg-stone-950 hover:border-amber-600 hover:text-amber-400 text-stone-300'
          }`}
          title={isCurrentPlaying ? 'Mettre en pause' : 'Écouter le bounce audio'}
        >
          {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={handleKeyDown}
              className="w-full bg-stone-950 border border-amber-600 text-[#fdf6e7] font-cordel text-sm px-2 py-0.5 rounded outline-none"
            />
          ) : (
            <div className="flex items-center gap-1.5 group/title">
              <h4
                onDoubleClick={() => setIsEditing(true)}
                className="font-cordel text-sm sm:text-base font-bold text-[#fdf6e7] truncate cursor-pointer hover:text-amber-400 transition-colors"
                title={`${currentTitle} (Double-clic pour renommer)`}
              >
                {currentTitle}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover/title:opacity-100 text-stone-400 hover:text-amber-400 p-0.5 transition-opacity"
                title="Renommer"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Badges métadonnées : Tempo & Pupitre */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {instrument && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-300 border border-stone-700/60">
                {instrument}
              </span>
            )}
            {item.tempo && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
                {item.tempo} BPM
              </span>
            )}
          </div>
        </div>

        {/* Sélecteur compact de visibilité */}
        <div className="relative inline-flex items-center shrink-0">
          <select
            value={currentVisibility}
            onChange={(e) => onVisibilityChange && onVisibilityChange(item.id, e.target.value)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer appearance-none pr-4 transition-colors ${visConfig.badgeClass} focus:outline-none`}
            title="Modifier la visibilité"
          >
            <option value="private" className="bg-stone-900 text-stone-300">🔒 Privé</option>
            <option value="mestre_group" className="bg-stone-900 text-emerald-300">👥 Groupe</option>
            <option value="public" className="bg-stone-900 text-amber-300">🌍 Public</option>
          </select>
          <span className="pointer-events-none absolute right-1.5 text-[8px] opacity-60">▼</span>
        </div>
      </div>

      {/* Pied de carte : Bouton Ouvrir et Corbeille */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
        <button
          type="button"
          onClick={handleOpenInSequencer}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 hover:border-amber-600 rounded-lg transition-all shadow-sm"
          title="Ouvrir dans Séquenciad'Or"
        >
          <span>🎛️</span>
          <span>Ouvrir</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestDelete && onRequestDelete(item)}
          className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 rounded-lg transition-all"
          title="Supprimer la ressource"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Barre de progression discrète en bordure inférieure */}
      {isCurrent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-950/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-100 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, audioProgress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
