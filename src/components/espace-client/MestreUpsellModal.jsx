import React from 'react';
import { X, Lock, Sparkles } from 'lucide-react';

export default function MestreUpsellModal({ lockedApp, onClose, onDiscoverPacks }) {
  if (!lockedApp) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-[#4a2e1b] relative p-6 text-center">
          <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative z-10 mb-4 inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
            <img src={lockedApp.iconUrl} alt={lockedApp.label} className="w-12 h-12 object-contain drop-shadow-md grayscale opacity-80" />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg border-2 border-[#4a2e1b]">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-[#fdf6e7] font-cordel relative z-10">
            L'outil {lockedApp.label} est verrouillé
          </h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6 leading-relaxed">
            Débloquez <strong>{lockedApp.label}</strong> ({lockedApp.desc}) et propulsez votre association dans une nouvelle dimension. Gérez, créez et partagez comme jamais auparavant.
          </p>
          
          <button 
            onClick={onDiscoverPacks}
            className="w-full flex items-center justify-center gap-2 bg-[#d2691e] hover:bg-[#b05819] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            Découvrir les forfaits
          </button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Non merci, je reste sur la carte gratuite
          </button>
        </div>
        
      </div>
    </div>
  );
}
