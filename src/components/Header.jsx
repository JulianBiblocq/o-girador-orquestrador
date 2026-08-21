import React, { useState } from 'react';
import { Menu, X, ChevronDown, Compass, PlayCircle, User, Sparkles, LogIn, ShoppingBag } from 'lucide-react';
import universData from '../data/univers.json';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

export default function Header({ 
  activeUniverse, 
  onSelectUniverse, 
  activeView, 
  onNavigate,
  onOpenTeaser
}) {
  const { t } = useLanguage();
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const { cartItems, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [universeDropdownOpen, setUniverseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentUniverseObj = universData.universes.find(u => u.id === activeUniverse) || universData.universes[0];

  const handleUniverseClick = (universe) => {
    setUniverseDropdownOpen(false);
    if (universe.status === 'active') {
      onSelectUniverse(universe.id);
    } else {
      onOpenTeaser(universe);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdf6e7]/95 backdrop-blur border-b-2 border-[#4a2e1b] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo & Brand: 
              - Smartphone (<768px): Icon + Title (Ultra-compact, no subtitle badge, no tagline)
              - Tablet (768-1023px) & Desktop (>=1024px): Icon + Title + Subtitle badge + Tagline
          */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => onNavigate('home')}>
            <img 
              src="/logo_rond.png" 
              alt="Logo O Girador" 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#8b4513] shadow-sm transition-transform hover:scale-105 shrink-0 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl text-[#4a2e1b] tracking-wider font-cordel">
                  {t('header.title')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-[#8b4513] text-[#fdf6e7] px-1.5 sm:px-2 py-0.5 rounded hidden md:inline-block">
                  {t('header.subtitle')}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#8b4513] font-medium hidden md:block">
                {t('header.tagline')}
              </p>
            </div>
          </div>

          {/* Center/Right Action Bar: Universe Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Universe Selector (Visible on Tablet >=768px & Desktop >=1024px) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUniverseDropdownOpen(!universeDropdownOpen)}
                className="flex items-center gap-2 bg-[#f4e8cf] hover:bg-[#ebd8b3] text-[#4a2e1b] px-3 py-1.5 rounded-lg border-2 border-[#8b4513]/40 font-semibold text-xs transition-all cursor-pointer shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-[#8b4513]" />
                <span><strong>{currentUniverseObj.name}</strong></span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8b4513] transition-transform ${universeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {universeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#fdf6e7] border-2 border-[#4a2e1b] rounded-lg shadow-xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-[#8b4513] uppercase tracking-wider border-b border-[#8b4513]/20 mb-1">
                    {t('header.changeUniverse')}
                  </div>
                  {universData.universes.map((uni) => (
                    <button
                      key={uni.id}
                      onClick={() => handleUniverseClick(uni)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f4e8cf] transition-colors ${
                        uni.id === activeUniverse ? 'bg-[#f4e8cf] font-bold text-[#8b4513]' : 'text-[#2c1d11]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{uni.name}</div>
                        <div className="text-[10px] text-gray-600">{uni.subtitle}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        uni.status === 'active' ? 'bg-green-700 text-white' : 'bg-amber-700 text-white'
                      }`}>
                        {uni.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links (≥ 1024px / lg) */}
          <nav className="hidden lg:flex items-center gap-5 text-[13px] font-bold text-[#4a2e1b]">
            <a href="#triptyque" onClick={() => activeView !== 'home' && onNavigate('home')} className="hover:text-[#d2691e] transition-colors">
              Applications
            </a>
            <a 
              href="#boutique"
              onClick={(e) => {
                if (activeView !== 'home') {
                  e.preventDefault();
                  onNavigate('home');
                  setTimeout(() => document.getElementById('boutique')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }}
              className="hover:text-[#e67e22] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Boutique</span>
            </a>
            <a href="#tarifs" onClick={() => activeView !== 'home' && onNavigate('home')} className="hover:text-[#d2691e] transition-colors">
              Tarifs
            </a>

            {/* Separator */}
            <div className="w-px h-4 bg-[#8b4513]/30 mx-1"></div>

            {/* Secondary Actions (Icons only) */}
            <button onClick={() => onNavigate('tutos')} className="hover:text-[#d2691e] transition-colors flex items-center justify-center p-1.5 rounded-full hover:bg-[#f4e8cf]" title={t('header.nav.tutos')}>
              <PlayCircle className="w-4 h-4 text-[#8b4513]" />
            </button>
            {!currentUser ? (
              <button 
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                    onNavigate('espace-client');
                  } catch (e) {
                    console.error("Login failed", e);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a2e1b] text-[#fdf6e7] rounded-lg text-xs font-bold hover:bg-[#2c1d11] transition-colors cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            ) : (
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={toggleCart}
                    className="relative flex items-center justify-center p-2 rounded-full hover:bg-[#f4e8cf] transition-colors"
                    title="Voir le panier"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#8b4513]" />
                    {cartItems.length > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                        {cartItems.length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4e8cf] text-[#4a2e1b] border border-[#8b4513] rounded-lg text-xs font-bold hover:bg-[#ebd8b3] transition-colors cursor-pointer shadow-sm"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        className="w-4 h-4 rounded-full object-cover" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                      />
                    ) : null}
                    <User 
                      className="w-4 h-4 text-[#8b4513]" 
                      style={{ display: currentUser.photoURL ? 'none' : 'block' }} 
                    />
                    <span>Mon Espace</span>
                    <ChevronDown className="w-3 h-3 text-[#8b4513]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#fdf6e7] rounded-lg shadow-xl border border-[#8b4513]/20 overflow-hidden z-50">
                    <button
                      onClick={() => {
                        onNavigate('espace-client');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs text-[#4a2e1b] font-semibold hover:bg-[#f4e8cf] transition-colors cursor-pointer border-b border-[#8b4513]/10"
                    >
                      Accéder à mon espace
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs text-[#8b4513] font-semibold hover:bg-[#f4e8cf] transition-colors cursor-pointer"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Burger Button ☰ (Visible on Smartphone & Tablet < 1024px / lg:hidden) */}
          <div className="flex lg:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="p-2.5 rounded-lg bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#ebd8b3] border border-[#8b4513]/40 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5 text-[#8b4513]" />
              <span className="text-xs font-bold text-[#4a2e1b] hidden sm:inline">Menu</span>
            </button>
          </div>

        </div>
      </div>

      {/* Drawer / Panel Coulissant pour Mobile & Tablette (< 1024px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop avec flou */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panneau latéral coulissant */}
          <div className="relative w-4/5 max-w-sm bg-[#fdf6e7] border-l-4 border-[#8b4513] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10">
            <div className="space-y-6">
              
              {/* En-tête du Drawer */}
              <div className="flex items-center justify-between border-b-2 border-[#4a2e1b]/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥁</span>
                  <span className="font-extrabold text-lg text-[#4a2e1b] font-cordel">
                    Menu Navigation
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#ebd8b3] rounded-full border border-[#8b4513]/40 cursor-pointer transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5 text-[#8b4513]" />
                </button>
              </div>

              {/* Sélecteur d'Univers Culturel */}
              <div className="bg-[#f4e8cf] p-3.5 rounded-xl border-2 border-[#8b4513]/30 space-y-2.5">
                <div className="text-[11px] font-bold text-[#8b4513] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#8b4513]" />
                  <span>{t('header.universeLabel')}</span>
                </div>
                <div className="space-y-1.5">
                  {universData.universes.map((uni) => (
                    <button
                      key={uni.id}
                      onClick={() => {
                        handleUniverseClick(uni);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        uni.id === activeUniverse 
                          ? 'bg-[#8b4513] text-[#fdf6e7] font-bold shadow' 
                          : 'bg-white/80 text-[#2c1d11] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{uni.name}</div>
                        <div className={`text-[10px] ${uni.id === activeUniverse ? 'text-amber-200' : 'text-gray-500'}`}>
                          {uni.subtitle}
                        </div>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        uni.status === 'active' 
                          ? (uni.id === activeUniverse ? 'bg-emerald-700 text-white' : 'bg-green-700 text-white') 
                          : 'bg-amber-700 text-white'
                      }`}>
                        {uni.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Liens de Navigation Principaux */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#8b4513] uppercase tracking-wider px-1 font-cordel">
                  Pages Principales
                </div>
                <nav className="flex flex-col space-y-1">
                  <button
                    onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                    className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeView === 'home' ? 'bg-[#8b4513] text-[#fdf6e7] shadow' : 'text-[#4a2e1b] hover:bg-[#f4e8cf]'
                    }`}
                  >
                    {t('header.nav.home')} (Accueil)
                  </button>
                  <a
                    href="#triptyque"
                    onClick={() => { if (activeView !== 'home') onNavigate('home'); setMobileMenuOpen(false); }}
                    className="text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#4a2e1b] hover:bg-[#f4e8cf] transition-colors"
                  >
                    {t('header.nav.triptyque')} (Nos 4 Applications)
                  </a>
                  <a
                    href="#tarifs"
                    onClick={() => { if (activeView !== 'home') onNavigate('home'); setMobileMenuOpen(false); }}
                    className="text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#4a2e1b] hover:bg-[#f4e8cf] transition-colors"
                  >
                    {t('header.nav.tarifs')} (Tarifs & Accès)
                  </a>
                </nav>
              </div>

              {/* Liens Secondaires */}
              <div className="space-y-2 pt-3 border-t border-[#4a2e1b]/15">
                <div className="text-[11px] font-bold text-[#8b4513] uppercase tracking-wider px-1 font-cordel">
                  Ressources
                </div>
                <nav className="flex flex-col space-y-1">
                  <button
                    onClick={() => { onNavigate('tutos'); setMobileMenuOpen(false); }}
                    className={`text-left px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      activeView === 'tutos' ? 'bg-[#8b4513] text-[#fdf6e7]' : 'text-[#4a2e1b] hover:bg-[#f4e8cf]'
                    }`}
                  >
                    <span>{t('header.nav.tutos')} (Tutoriels Vidéos)</span>
                    <PlayCircle className="w-4 h-4 text-[#8b4513]" />
                  </button>
                  <a
                    href="#boutique"
                    onClick={(e) => { 
                      if (activeView !== 'home') {
                        e.preventDefault();
                        onNavigate('home'); 
                        setTimeout(() => document.getElementById('boutique')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      }
                      setMobileMenuOpen(false); 
                    }}
                    className="text-left px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-[#4a2e1b] hover:bg-[#f4e8cf]"
                  >
                    <span>{t('header.nav.boutique') || 'Boutique'}</span>
                    <Sparkles className="w-4 h-4 text-[#e67e22]" />
                  </a>
                </nav>
              </div>

            </div>

            {/* Authentification / Espace Client */}
            <div className="pt-4 border-t border-[#4a2e1b]/20">
              {!currentUser ? (
                <button 
                  onClick={async () => { 
                    try {
                      await loginWithGoogle(); 
                      setMobileMenuOpen(false); 
                      onNavigate('espace-client');
                    } catch (e) {
                      console.error("Login failed", e);
                    }
                  }}
                  className="w-full py-2.5 bg-[#8b4513] hover:bg-[#6e370f] text-[#fdf6e7] font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div 
                    className="w-full py-2.5 bg-[#f4e8cf] text-[#4a2e1b] border border-[#8b4513]/40 font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        className="w-4 h-4 rounded-full object-cover" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                      />
                    ) : null}
                    <User 
                      className="w-4 h-4 text-[#8b4513]" 
                      style={{ display: currentUser.photoURL ? 'none' : 'block' }} 
                    />
                    <span>Mon Espace</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#8b4513]/20 ml-2">
                    <button 
                      onClick={() => { onNavigate('espace-client'); setMobileMenuOpen(false); }}
                      className="text-left py-1.5 text-[#4a2e1b] text-xs font-semibold hover:text-[#d2691e] transition-colors cursor-pointer"
                    >
                      Accéder à mon espace
                    </button>
                    <button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-left py-1.5 text-[#8b4513] text-xs font-semibold hover:text-[#d2691e] transition-colors cursor-pointer"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de Fermeture ✕ clair bas de tiroir */}
            <div className="pt-4 mt-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-[#fdf6e7] font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
              >
                <X className="w-4 h-4 text-white" />
                <span>Fermer le menu</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
