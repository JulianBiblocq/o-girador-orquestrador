import React, { useState } from 'react';
import { db } from '../../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Sparkles, Store, Check, Music, Hammer, BookOpen, Activity, AlertCircle } from 'lucide-react';

export default function CreatePackModal({ isOpen, onClose, selectedItems, packType, authorUid, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceEUR, setPriceEUR] = useState('');
  const [priceBRL, setPriceBRL] = useState('');
  const [pricePoints, setPricePoints] = useState('');
  const [universeId, setUniverseId] = useState('maracatu'); // 'maracatu', 'samba', 'capoeira', 'universal'
  const [targetApp, setTargetApp] = useState('sequenceur'); // 'sequenceur', 'dancador', 'manager'
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError("Le pack doit contenir au moins un élément.");
      return;
    }
    if (!name || !priceEUR || !priceBRL || !pricePoints) {
      setError("Veuillez remplir tous les champs obligatoires (Nom et Prix).");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formattedItems = selectedItems.map(item => ({
        id: item.id,
        title: item.label,
        type: item.type, // 'rhythm', 'choreo', 'culture', 'fabrication', 'toada'
        sourceCollection: item.sourceCollection || (item.type === 'rhythm' || item.type === 'section' ? 'presets' : 'choreographies')
      }));

      const newPack = {
        name,
        description,
        type: packType,
        targetApp,
        universeId,
        isUniversal: universeId === 'universal',
        pricePoints: parseInt(pricePoints, 10),
        prices: {
          EUR: parseFloat(priceEUR),
          BRL: parseFloat(priceBRL)
        },
        coverUrl,
        items: formattedItems,
        features: [
          `${formattedItems.length} élément(s) inclus`,
          "Accès à vie après déblocage"
        ],
        createdBy: authorUid,
        createdAt: serverTimestamp(),
        isActive: true // Peut être utilisé pour masquer temporairement un pack
      };

      await addDoc(collection(db, 'premium_packs'), newPack);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la création du pack :", err);
      setError("Une erreur est survenue lors de l'enregistrement du pack.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (packType) {
      case 'rhythms': return <Music className="w-5 h-5 text-purple-600" />;
      case 'choreos': return <Activity className="w-5 h-5 text-pink-600" />;
      case 'culture': return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'fabrication': return <Hammer className="w-5 h-5 text-orange-600" />;
      case 'toadas': return <Music className="w-5 h-5 text-yellow-600" />;
      default: return <Store className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-amber-50">
          <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
            {getIcon()}
            Créer un Pack Premium ({selectedItems.length} éléments)
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom du Pack *</label>
                <input 
                  type="text" 
                  required
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-gray-50 p-2.5 border"
                  placeholder="Ex: Pack Essentiel Maracatu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description courte</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-gray-50 p-2.5 border min-h-[80px]"
                  placeholder="Ce que contient ce pack..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">URL de l'image (Optionnel)</label>
                <input 
                  type="url" 
                  value={coverUrl} 
                  onChange={e => setCoverUrl(e.target.value)} 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-gray-50 p-2.5 border"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">App Cible</label>
                  <select 
                    value={targetApp} 
                    onChange={e => setTargetApp(e.target.value)} 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white p-2.5 border"
                  >
                    <option value="sequenceur">Séquenceur</option>
                    <option value="dancador">Dançador</option>
                    <option value="manager">Organizador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Univers</label>
                  <select 
                    value={universeId} 
                    onChange={e => setUniverseId(e.target.value)} 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white p-2.5 border"
                  >
                    <option value="maracatu">Maracatu</option>
                    <option value="samba">Samba</option>
                    <option value="capoeira">Capoeira</option>
                    <option value="universal">Universel</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Prix de Vente *</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-gray-400 font-bold">EUR €</span>
                    <input 
                      type="number" 
                      min="0" step="0.01" required
                      value={priceEUR} 
                      onChange={e => setPriceEUR(e.target.value)} 
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white p-2 border"
                      placeholder="15.00"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-gray-400 font-bold">BRL R$</span>
                    <input 
                      type="number" 
                      min="0" step="0.01" required
                      value={priceBRL} 
                      onChange={e => setPriceBRL(e.target.value)} 
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white p-2 border"
                      placeholder="45.00"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 border-dashed">
                    <span className="w-12 text-amber-500 font-bold flex items-center justify-center"><Sparkles className="w-4 h-4"/></span>
                    <input 
                      type="number" 
                      min="0" step="1" required
                      value={pricePoints} 
                      onChange={e => setPricePoints(e.target.value)} 
                      className="w-full border-amber-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-amber-50 p-2 border text-amber-900"
                      placeholder="Prix en points d'Axé (ex: 500)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 text-sm">
              Contenu du Pack ({selectedItems.length} éléments)
            </div>
            <div className="max-h-40 overflow-y-auto bg-white p-2">
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((item, idx) => (
                  <span key={idx} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>Création en cours...</>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  Publier dans la Boutique
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
