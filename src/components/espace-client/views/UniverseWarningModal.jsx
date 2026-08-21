import React from 'react';
import { AlertTriangle, X, Compass, ExternalLink } from 'lucide-react';

export default function UniverseWarningModal({ isOpen, onClose, onConfirm, pack, userUniverse }) {
  if (!isOpen || !pack) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-orange-200">
        
        {/* Header : Avertissement Bienveillant */}
        <div className="bg-orange-50 border-b border-orange-100 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-900">Alerte d'écosystème</h3>
              <p className="text-xs text-orange-700 mt-0.5">Ce pack appartient à un autre univers.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-orange-400 hover:text-orange-600 hover:bg-orange-100/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="text-gray-600 space-y-4 text-sm leading-relaxed">
            <p>
              Vous êtes sur le point d'acquérir le <strong>{pack.name}</strong>.
            </p>
            <p>
              Ce pack a été spécialement conçu pour l'univers <strong className="capitalize text-[#4a2e1b]">{pack.universeId}</strong>, 
              alors que votre association évolue principalement dans l'univers <strong className="capitalize text-[#4a2e1b]">{userUniverse}</strong>.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-xs">
              <strong>Que cela signifie-t-il ?</strong> Vous pourrez utiliser ce contenu, mais pour en tirer pleinement parti dans vos applications (Séquenceur, Dançador), vous devrez débloquer l'accès complet à cet univers dans vos paramètres d'association.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-500 hover:text-gray-700 font-bold text-sm transition-colors"
          >
            Annuler
          </button>
          
          <button 
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold text-sm rounded-lg transition-colors shadow-sm"
          >
            Acheter quand même
          </button>
          
          <button 
            onClick={() => {
              // Simule l'ouverture des réglages d'univers
              alert(`Redirection vers la découverte de l'univers : ${pack.universeId}`);
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors shadow-md"
          >
            <Compass className="w-4 h-4" />
            Découvrir cet univers
          </button>
        </div>
        
      </div>
    </div>
  );
}
