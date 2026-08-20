import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TriptychSection from './components/TriptychSection';
import PricingSynergySection from './components/PricingSynergySection';
import CreatorSection from './components/CreatorSection';
import TutorialsSection from './components/TutorialsSection';
import NewsletterSection from './components/NewsletterSection';
import AdminLoginModal from './components/AdminLoginModal';
import Footer from './components/Footer';
import UniverseModal from './components/UniverseModal';
import CheckoutFlow from './components/checkout/CheckoutFlow';
import AddonsStore from './components/addons/AddonsStore';
import EspaceClient from './components/espace-client/EspaceClient';
import CartDrawer from './components/shop/CartDrawer';
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
    } else if (window.location.hash === '#admin' || window.location.hash === '#espace-client') {
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

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
