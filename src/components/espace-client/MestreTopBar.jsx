import React, { useState } from 'react';
import { Lock, LayoutDashboard, Flame, Settings, Store, Sparkles, X } from 'lucide-react';

export default function MestreTopBar({ associationData, activeTab, setActiveTab }) {
  const [lockedAppClicked, setLockedAppClicked] = useState(null);

  const hasPack = (packId) => {
    if (associationData?.isAdmin || associationData?.role === 'admin') return true;
    if (associationData?.appAccess?.[packId] === true) return true;
    const packs = associationData?.unlockedPacks || [];
    
    let userMaxLevel = 1;
    for (const p of packs) {
      if (p.includes('integrale')) userMaxLevel = Math.max(userMaxLevel, 4);
      else if (p.includes('gestion')) userMaxLevel = Math.max(userMaxLevel, 3);
      else if (p.includes('createur')) userMaxLevel = Math.max(userMaxLevel, 2);
    }
    
    let requiredLevel = 5;
    if (packId === 'dancador' || packId === 'integrale') requiredLevel = 4;
    if (packId === 'manager' || packId === 'vitrine' || packId === 'gestion') requiredLevel = 3;
    if (packId === 'sequenceur' || packId === 'createur') requiredLevel = 2;

    if (packs.some(p => p.includes(packId) || p.includes(`${packId}-solo`))) {
      return true;
    }

    return userMaxLevel >= requiredLevel;
  };
  const apps = [
    {
      id: 'dashboard',
      label: 'Accueil',
      desc: 'Vue d\'ensemble',
      isIcon: false,
      iconUrl: '/logos/dashboard.png',
      isOwned: true,
      url: '#',
      colorActive: 'bg-[#8b4513] border-amber-500',
      colorHover: 'hover:bg-[#6e370f] hover:border-amber-400',
      textActive: 'text-amber-400',
      textHover: 'group-hover:text-amber-400',
      descTextActive: 'text-amber-200',
      descTextHover: 'group-hover:text-amber-200'
    },
    {
      id: 'manager',
      label: 'Organizador',
      desc: 'Gestion & Association',
      iconUrl: '/logos/organizador.png',
      isOwned: hasPack('manager'),
      url: 'https://organizador.o-girador.com',
      colorActive: 'bg-[#fdf6e7] border-[#d4b895]',
      colorHover: 'hover:bg-[#fdf6e7] hover:border-[#d4b895]',
      textActive: 'text-[#4a2e1b]',
      textHover: 'group-hover:text-[#4a2e1b]',
      descTextActive: 'text-[#8b4513]',
      descTextHover: 'group-hover:text-[#8b4513]'
    },
    {
      id: 'sequenceur',
      label: 'Sequenciador',
      desc: 'Création Audio',
      iconUrl: '/logos/sequenciador.png',
      isOwned: hasPack('sequenceur'),
      url: 'https://sequenciador.o-girador.com',
      colorActive: 'bg-[#1a1a1a] border-[#000000]',
      colorHover: 'hover:bg-[#1a1a1a] hover:border-[#000000]',
      textActive: 'text-white',
      textHover: 'group-hover:text-white',
      descTextActive: 'text-gray-300',
      descTextHover: 'group-hover:text-gray-300'
    },
    {
      id: 'dancador',
      label: 'Dançador',
      desc: 'Studio Chorégraphique',
      iconUrl: '/logos/dancador.png',
      isOwned: hasPack('dancador'),
      url: 'https://dancador.o-girador.com',
      colorActive: 'bg-[#b22222] border-[#8b0000]',
      colorHover: 'hover:bg-[#b22222] hover:border-[#8b0000]',
      textActive: 'text-white',
      textHover: 'group-hover:text-white',
      descTextActive: 'text-red-100',
      descTextHover: 'group-hover:text-red-100'
    },
    {
      id: 'vitrine',
      label: 'Mostrador',
      desc: 'Site Public',
      iconUrl: '/logos/mostrador.png',
      isOwned: hasPack('vitrine'),
      url: 'https://mostrador.o-girador.com',
      colorActive: 'bg-[#d2691e] border-[#b05819]',
      colorHover: 'hover:bg-[#d2691e] hover:border-[#b05819]',
      textActive: 'text-white',
      textHover: 'group-hover:text-white',
      descTextActive: 'text-orange-100',
      descTextHover: 'group-hover:text-orange-100'
    },
    {
      id: 'terreiro',
      label: 'Terreiro',
      desc: 'Communauté',
      isIcon: true,
      iconComponent: <Flame className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
      isOwned: true,
      url: '#',
      colorActive: 'bg-[#b05819] border-amber-400',
      colorHover: 'hover:bg-[#d2691e] hover:border-amber-300',
      textActive: 'text-white',
      textHover: 'group-hover:text-white',
      descTextActive: 'text-amber-100',
      descTextHover: 'group-hover:text-amber-100'
    },
    {
      id: 'boutique',
      label: 'Boutique',
      desc: 'Add-ons & Forfaits',
      isIcon: true,
      iconComponent: <Store className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
      isOwned: true,
      url: '#',
      colorActive: 'bg-[#b05819] border-[#d2691e]',
      colorHover: 'hover:bg-[#d2691e] hover:border-amber-500',
      textActive: 'text-white',
      textHover: 'group-hover:text-white',
      descTextActive: 'text-orange-200',
      descTextHover: 'group-hover:text-orange-200'
    },
    {
      id: 'profile',
      label: 'Réglages',
      desc: 'Profil & Identité',
      isIcon: true,
      iconComponent: <Settings className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
      isOwned: true,
      url: '#',
      colorActive: 'bg-gray-800 border-gray-600',
      colorHover: 'hover:bg-gray-700 hover:border-gray-500',
      textActive: 'text-white',
      textHover: 'group-hover:text-white',
      descTextActive: 'text-gray-300',
      descTextHover: 'group-hover:text-gray-300'
    }
  ];

  return (
    <div className="bg-[#4a2e1b] rounded-xl shadow-lg p-4 mb-6 relative overflow-hidden">
      {/* Texture de fond */}
      <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-2">
        
        <div className="text-white flex-shrink-0 hidden xl:flex flex-col items-center justify-center mr-2 bg-amber-500/10 px-2 py-2.5 rounded-lg border border-amber-500/20 gap-2">
          <span className="text-xs font-black uppercase font-cordel text-amber-500 leading-none">H</span>
          <span className="text-xs font-black uppercase font-cordel text-amber-500 leading-none">U</span>
          <span className="text-xs font-black uppercase font-cordel text-amber-500 leading-none">B</span>
        </div>

        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-end gap-1 sm:gap-2 w-full">
          {apps.map(app => (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                if (app.isOwned && setActiveTab) {
                  setActiveTab(app.id);
                } else if (!app.isOwned) {
                  setLockedAppClicked(app);
                }
              }}
              className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all group outline-none ${
                app.isOwned 
                  ? activeTab === app.id
                    ? `${app.colorActive} shadow-md transform scale-[1.02]`
                    : `bg-[#5c3a21] border-[#8b4513]/50 cursor-pointer shadow-sm ${app.colorHover}` 
                  : 'bg-[#3d2516] border-[#4a2e1b] opacity-60 grayscale cursor-not-allowed'
              } flex-1 min-w-[75px] md:max-w-none`}
            >
              <div className="relative mb-2 flex items-center justify-center h-10 w-10 shrink-0">
                {app.isIcon ? app.iconComponent : (
                  <img 
                    src={app.iconUrl} 
                    alt={app.label} 
                    className={`w-10 h-10 object-contain drop-shadow-md transition-transform ${app.isOwned ? 'group-hover:scale-110' : ''} ${['vitrine', 'dashboard', 'terreiro'].includes(app.id) ? 'rounded-full' : ''}`} 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                {!app.isOwned && (
                  <div className="absolute -top-1 -right-1 bg-gray-800 text-gray-300 p-1 rounded-full shadow-lg">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center justify-start w-full">
                <span className={`h-8 flex items-center justify-center text-[11px] font-bold uppercase tracking-wider mb-0.5 text-center leading-tight line-clamp-2 ${activeTab === app.id ? app.textActive : `text-gray-300 ${app.textHover}`}`}>
                  {app.label}
                </span>
                <span className={`h-6 flex items-start justify-center text-[9px] text-center leading-tight line-clamp-2 ${activeTab === app.id ? app.descTextActive : `text-gray-400 ${app.descTextHover}`}`}>
                  {app.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upsell Modal (Frustration Positive) */}
      {lockedAppClicked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#4a2e1b] relative p-6 text-center">
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
              <button 
                onClick={() => setLockedAppClicked(null)}
                className="absolute top-4 right-4 p-1 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10 mb-4 inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                <img src={lockedAppClicked.iconUrl} alt={lockedAppClicked.label} className="w-12 h-12 object-contain drop-shadow-md grayscale opacity-80" />
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg border-2 border-[#4a2e1b]">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-[#fdf6e7] font-cordel relative z-10">
                L'outil {lockedAppClicked.label} est verrouillé
              </h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Débloquez <strong>{lockedAppClicked.label}</strong> ({lockedAppClicked.desc}) et propulsez votre association dans une nouvelle dimension. Gérez, créez et partagez comme jamais auparavant.
              </p>
              
              <button 
                onClick={() => {
                  setLockedAppClicked(null);
                  if (setActiveTab) setActiveTab('boutique');
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#d2691e] hover:bg-[#b05819] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Découvrir les forfaits
              </button>
              
              <button 
                onClick={() => setLockedAppClicked(null)}
                className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Non merci, je reste sur la carte gratuite
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
