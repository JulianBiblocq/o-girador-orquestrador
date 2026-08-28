import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TriptychSection from './components/TriptychSection';
import PricingSynergySection from './components/PricingSynergySection';
import CreatorSection from './components/CreatorSection';
import TutorialsSection from './components/TutorialsSection';
import PublicNetworkSection from './components/PublicNetworkSection';
import NewsletterSection from './components/NewsletterSection';
import PublicReviewsSection from './components/PublicReviewsSection';
import AdminLoginModal from './components/AdminLoginModal';
import Footer from './components/Footer';
import UniverseModal from './components/UniverseModal';
import CheckoutFlow from './components/checkout/CheckoutFlow';
import AddonsStore from './components/addons/AddonsStore';
import EspaceClient from './components/espace-client/EspaceClient';
import CartDrawer from './components/shop/CartDrawer';
import PublicCatalogue from './components/PublicCatalogue';
import LegalView from './components/LegalView';
import FreeSignupView from './components/FreeSignupView';
import { Loader2 } from 'lucide-react';

// Lazy loading pour le panneau d'administration lourd (/admin)
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

function AppContent() {
  const [activeUniverse, setActiveUniverse] = useState('maracatu');
  const [activeView, setActiveView] = useState('home'); // 'home' | 'a-propos' | 'tutos' | 'admin' | 'checkout'
  const [activePlan, setActivePlan] = useState(null);
  const [teaserModalUniverse, setTeaserModalUniverse] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.hash.startsWith('#admin')) {
      setActiveView('admin');
    } else if (window.location.hash.startsWith('#espace-client')) {
      setActiveView('espace-client');
    } else if (window.location.hash.startsWith('#catalogue-public')) {
      setActiveView('catalogue-public');
    } else if (window.location.hash.startsWith('#legal')) {
      setActiveView('legal');
    } else if (window.location.hash.startsWith('#inscription-gratuite')) {
      setActiveView('free-signup');
    }
  }, []);

  const handleSelectUniverse = (universeId) => {
    setActiveUniverse(universeId);
  };

  const handleOpenTeaser = (universeObj) => {
    setTeaserModalUniverse(universeObj);
  };

  const handleNavigate = (view) => {
    setActiveView(view);
    if (view === 'admin') {
      window.location.hash = 'admin';
    } else if (view === 'espace-client') {
      window.location.hash = 'espace-client';
    } else if (view === 'catalogue-public') {
      window.location.hash = 'catalogue-public';
    } else if (view === 'legal') {
      window.location.hash = 'legal';
    } else if (view === 'free-signup') {
      window.location.hash = 'inscription-gratuite';
    } else if (['#admin', '#espace-client', '#catalogue-public', '#legal', '#inscription-gratuite'].includes(window.location.hash)) {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fdf6e7] text-[#2c1d11] font-sans selection:bg-[#8b4513] selection:text-white">
      
      {/* Header */}
      <Header
        activeUniverse={activeUniverse}
        onSelectUniverse={handleSelectUniverse}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenTeaser={handleOpenTeaser}
      />

      {/* Main Views */}
      {activeView === 'home' && (
        <main>
          <HeroSection activeUniverse={activeUniverse} onNavigate={handleNavigate} />
          <TriptychSection />
          <PricingSynergySection onSelectPlan={(plan) => { setActivePlan(plan); handleNavigate('checkout'); }} />
          <AddonsStore onNavigate={handleNavigate} />
          <PublicNetworkSection onNavigate={handleNavigate} />
          <PublicReviewsSection onNavigate={handleNavigate} />
          <TutorialsSection />
          <NewsletterSection activeUniverse={activeUniverse} />
        </main>
      )}

      {activeView === 'tutos' && (
        <main className="py-6">
          <TutorialsSection />
          <NewsletterSection activeUniverse={activeUniverse} />
        </main>
      )}

      {activeView === 'a-propos' && (
        <main>
          <CreatorSection onNavigateHome={() => handleNavigate('home')} />
        </main>
      )}

      {activeView === 'admin' && (
        <main>
          <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[#8b4513]">
              <Loader2 className="w-10 h-10 animate-spin text-[#8b4513]" />
              <p className="font-bold text-xs uppercase tracking-wider">Chargement du Back-Office Administrateur...</p>
            </div>
          }>
            <AdminDashboard onNavigateHome={() => handleNavigate('home')} />
          </Suspense>
        </main>
      )}

      {activeView === 'checkout' && (
        <main>
          <CheckoutFlow plan={activePlan} onCancel={() => handleNavigate('home')} />
        </main>
      )}

      {activeView === 'espace-client' && (
        <main>
          <EspaceClient onNavigateHome={() => handleNavigate('home')} />
        </main>
      )}

      {activeView === 'catalogue-public' && (
        <main>
          <PublicCatalogue onNavigateHome={() => handleNavigate('home')} />
        </main>
      )}

      {activeView === 'legal' && (
        <main>
          <LegalView onNavigateHome={() => handleNavigate('home')} />
        </main>
      )}

      {activeView === 'free-signup' && (
        <main>
          <FreeSignupView onNavigateHome={() => handleNavigate('home')} onNavigateToClient={() => handleNavigate('espace-client')} />
        </main>
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAdminModal={() => setAdminModalOpen(true)} />

      {/* Modals & Overlays */}
      {teaserModalUniverse && (
        <UniverseModal universe={teaserModalUniverse} onClose={() => setTeaserModalUniverse(null)} />
      )}

      <AdminLoginModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      
      <CartDrawer />

    </div>
  );
}

import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
