/**
 * Modale d'aperçu du Terreiro protégeant les données brutes avant adoption.
 * Affiche des échantillons partiels (audio 8 mesures, vidéo courte, flou CSS) et gère l'adoption atomique.
 */

import React, { useState } from 'react';
import { X, Sparkles, Music, Activity, BookOpen, Hammer, Lock, CheckCircle2, Loader2, Play } from 'lucide-react';
import { adoptResource } from '../../../services/adoptionService.js';

export default function PreviewModal({
  isOpen,
  onClose,
  resource,
  collectionName = 'documents',
  buyerGroupId,
  buyerPoints = 0,
  isAlreadyUnlocked = false,
  onAdoptSuccess
}) {
  const [adopting, setAdopting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  if (!isOpen || !resource) return null;

  const cost = Number(resource.axeValue || 5);
  const isAuthor = buyerGroupId && (buyerGroupId === resource.authorGroupId || buyerGroupId === resource.groupId);
  const canAfford = buyerPoints >= cost;
  const tier = resource.tier || 'varal';

  const handleAdopt = async () => {
    if (isAlreadyUnlocked || isAuthor || !canAfford) return;
    setAdopting(true);

    try {
      const res = await adoptResource({
        collectionName,
        resourceId: resource.id,
        buyerGroupId
      });

      setToastMessage(`Ressource adoptée ! (-${cost} pts d'Axé)`);
      if (onAdoptSuccess) onAdoptSuccess(res);
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      alert("Erreur lors de l'adoption : " + err.message);
    } finally {
      setAdopting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-amber-200 animate-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="bg-[#8b4513] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              {tier === 'sequence' ? <Music className="w-4 h-4" /> : tier === 'combo' ? <Activity className="w-4 h-4" /> : tier === 'lutherie' ? <Hammer className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold font-cordel text-lg text-white truncate max-w-sm">{resource.title || resource.titre || resource.nom || 'Aperçu'}</h3>
              <p className="text-xs text-amber-200/80">Partagé par {resource.authorName || 'Mestre'}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={adopting} className="text-white/70 hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* Corps : Aperçu contextuel protégé */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {toastMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> {toastMessage}
            </div>
          )}

          {/* Séquence / Rythme */}
          {tier === 'sequence' && (
            <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Extrait audio (8 mesures)</p>
              {resource.previewAudioUrl || resource.audioUrl ? (
                <audio controls className="w-full h-10" src={resource.previewAudioUrl || resource.audioUrl} />
              ) : (
                <div className="h-10 bg-amber-100/60 rounded-lg flex items-center justify-center text-xs text-amber-800 font-medium">Lecteur audio prêt pour écoute</div>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600 pt-1">
                <span>Tempo : <strong>{resource.bpm || 110} BPM</strong></span>
                <span>Métrique : <strong>{resource.metric || '4/4'}</strong></span>
                <span>Instruments : <strong>{resource.instrumentCount || 'Alfaia, Gonguê, Caixa...'}</strong></span>
              </div>
              <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${isAlreadyUnlocked ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white/80 border-amber-200/50 text-amber-900'}`}>
                {isAlreadyUnlocked ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" /> : <Lock className="w-3.5 h-3.5 shrink-0 text-amber-700" />}
                <span>
                  {isAlreadyUnlocked ? "Ressource débloquée : patterns complets et micro-timings disponibles dans votre répertoire." : "Les patterns complets et micro-timings multipistes seront débloqués à l'adoption."}
                </span>
              </div>
            </div>
          )}

          {/* Combo / Chorégraphie */}
          {(tier === 'combo' || resource.type === 'choreo') && (
            <div className="space-y-3 bg-pink-50/40 p-4 rounded-xl border border-pink-100">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-900">Boucle visuelle (5-8s)</p>
              {resource.previewVideoUrl ? (
                <video autoPlay loop muted playsInline src={resource.previewVideoUrl} className="w-full max-h-44 object-cover rounded-lg shadow-sm" />
              ) : (
                <div className="h-32 bg-pink-100/60 rounded-lg flex flex-col items-center justify-center text-xs text-pink-700 gap-1"><Play className="w-6 h-6" /><span>Extrait chorégraphique</span></div>
              )}
              <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${isAlreadyUnlocked ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white/80 border-pink-200/50 text-pink-900'}`}>
                {isAlreadyUnlocked ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" /> : <Lock className="w-3.5 h-3.5 shrink-0 text-pink-700" />}
                <span>
                  {isAlreadyUnlocked ? "Ressource débloquée : timeline détaillée et Beat Tracker accessibles dans votre répertoire." : "La timeline détaillée, rôles et repères Beat Tracker sont masqués."}
                </span>
              </div>
            </div>
          )}

          {/* Varal / Fiches de Lutherie / Documents */}
          {(tier === 'varal' || tier === 'lutherie' || resource.type === 'culture_fiche' || resource.type === 'fabrication') && (
            <div className="space-y-3">
              <div className="relative overflow-hidden bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-2">{resource.description || resource.summary || "Fiche pratique partagée avec la communauté."}</p>
                <div className={`relative text-xs text-gray-600 ${isAlreadyUnlocked ? 'select-text' : 'line-clamp-3 select-none filter blur-[1px] pointer-events-none'}`}>
                  {resource.content || resource.materials || "Fiche technique et contenu intégral consultables sans restriction dans votre répertoire."}
                </div>
                {!isAlreadyUnlocked && (
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-100 via-gray-50/80 to-transparent flex items-end justify-center pb-2">
                    <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-600" /> Gabarits et contenu intégral masqués
                    </span>
                  </div>
                )}
              </div>
              {isAlreadyUnlocked && (
                <div className="p-2.5 bg-green-50 rounded-lg border border-green-200 text-xs text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
                  <span>Ressource acquise : consultation directe et complète sans surcoût.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pied de page : Coût & Adoption */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="text-xs text-gray-500 font-medium">
              Coût d'adoption : {isAlreadyUnlocked ? (
                <strong className="text-green-700 font-bold">0 pt (Déjà acquis)</strong>
              ) : (
                <strong className="text-amber-800 font-bold">{cost} pts d'Axé</strong>
              )}
            </div>
            <div className="text-xs text-gray-500">Votre solde : <strong className={canAfford || isAlreadyUnlocked ? "text-green-700 font-bold" : "text-red-600 font-bold"}>{buyerPoints} pts</strong></div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={onClose} disabled={adopting} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Fermer</button>
            {isAuthor ? (
              <button disabled className="px-5 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-bold cursor-not-allowed">Votre création (Auteur)</button>
            ) : isAlreadyUnlocked ? (
              <button onClick={onClose} className="px-5 py-2 bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Déjà dans votre répertoire
              </button>
            ) : !canAfford ? (
              <button disabled className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold cursor-not-allowed">
                Solde insuffisant ({cost - buyerPoints} pts manquants)
              </button>
            ) : (
              <button onClick={handleAdopt} disabled={adopting} className="flex items-center gap-2 px-5 py-2 bg-[#8b4513] hover:bg-[#6e370f] text-white text-sm font-bold rounded-lg shadow-md transition-all disabled:opacity-50">
                {adopting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                Adopter pour {cost} pts d'Axé
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
