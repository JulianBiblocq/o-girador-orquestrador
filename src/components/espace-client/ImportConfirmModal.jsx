import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { DownloadCloud, Loader2, X, AlertCircle } from 'lucide-react';

export default function ImportConfirmModal({ isOpen, onClose, importParams, associationData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !importParams) return null;

  const handleImport = async () => {
    setLoading(true);
    setError('');

    try {
      const { import_id, type } = importParams;
      const collectionName = type === 'rhythm' ? 'rhythms' : 'choreographies';
      
      const docRef = doc(db, collectionName, import_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("La création originale n'existe plus ou l'ID est invalide.");
        setLoading(false);
        return;
      }

      const originalData = docSnap.data();
      const originalAuthor = originalData.authorName || 'Inconnu';

      // Création du duplicata pour l'association courante
      const newData = {
        ...originalData,
        groupId: associationData.groupId,
        authorName: associationData.name || associationData.nom || 'Notre Association',
        title: `${originalData.title || 'Création'} (Importé de ${originalAuthor})`,
        isPublic: false, // Forcer en privé par défaut lors de l'import
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Supprimer l'ID pour que Firebase en génère un nouveau
      delete newData.id;

      await addDoc(collection(db, collectionName), newData);

      setLoading(false);
      onSuccess();
      onClose();

    } catch (err) {
      console.error("Erreur lors de l'import :", err);
      setError("Une erreur est survenue lors de l'importation.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#8b4513] text-white p-6 relative">
          <button 
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
            <DownloadCloud className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-cordel">Importation de Création</h3>
          <p className="text-amber-100/90 text-sm mt-2">
            Un Mestre vous a partagé une création. Voulez-vous l'ajouter à votre répertoire ?
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              Cette action va copier la création (et tous ses paramètres) dans votre espace. Elle sera marquée comme privée.
            </p>
            <p className="text-sm text-gray-600 font-bold mt-2">
              Le titre incluera la mention "(Importé)".
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8b4513] hover:bg-[#6e370f] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importation...
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  Importer
                </>
              )}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
