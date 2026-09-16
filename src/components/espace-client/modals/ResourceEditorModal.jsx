/**
 * Modale d'édition et de resoumission d'une ressource du Mestre.
 * Affiche l'encart pédagogique et remplace le bouton Sauvegarder par Renvoyer pour validation.
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Save, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import EditorialFeedbackBanner from '../dashboard/EditorialFeedbackBanner.jsx';
import { resubmitResource, updateResource } from '../../../services/resourceService.js';

export default function ResourceEditorModal({ isOpen, onClose, resource, collectionName = 'rhythms', onResubmitted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || resource.titre || resource.nom || '');
      setDescription(resource.description || resource.details || '');
      setNotes(resource.notes || resource.culturalNotes || '');
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  const isNeedsRevision = resource.publicationStatus === 'needs_revision';

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatePayload = {
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim()
    };

    try {
      if (isNeedsRevision) {
        await resubmitResource(collectionName, resource.id, updatePayload);
        setToastMessage("Fiche renvoyée avec succès à l'équipe éditoriale !");
      } else {
        await updateResource(collectionName, resource.id, updatePayload);
        setToastMessage("Modifications enregistrées !");
      }

      if (onResubmitted) onResubmitted();
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1400);
    } catch (err) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-amber-200 animate-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="bg-[#8b4513] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold font-cordel text-lg text-white">Édition de Création</h3>
            <span className="text-[10px] uppercase font-bold bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded border border-amber-400/30">
              Palier {resource.tier || 'standard'}
            </span>
          </div>
          <button onClick={onClose} disabled={loading} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {toastMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {toastMessage}
            </div>
          )}

          {/* Encart pédagogique si retour admin */}
          {isNeedsRevision && (
            <EditorialFeedbackBanner
              editorialReview={resource.editorialReview}
              currentTier={resource.tier}
            />
          )}

          <form id="resource-edit-form" onSubmit={handleAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#8b4513] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Description / Contexte</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre création, l'intention musicale ou chorégraphique..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8b4513] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Précisions culturelles & techniques</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instruments requis, références traditionnelles, conseils d'interprétation..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8b4513] outline-none resize-none"
              />
            </div>
          </form>
        </div>

        {/* Actions en pied de page */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fermer
          </button>

          {isNeedsRevision ? (
            <button
              type="submit"
              form="resource-edit-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Renvoyer pour validation
            </button>
          ) : (
            <button
              type="submit"
              form="resource-edit-form"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8b4513] hover:bg-[#6e370f] text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sauvegarder
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
