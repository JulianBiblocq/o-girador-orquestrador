import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { User, Sparkles, CheckCircle2, LayoutDashboard, Settings, BarChart3, PackageOpen } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import OnboardingWizard from './OnboardingWizard';
import TabIdentity from './tabs/TabIdentity';
import TabAnalytics from './tabs/TabAnalytics';
import TabTools from './tabs/TabTools';

export default function EspaceClient({ onNavigateHome }) {
  const { currentUser, userData, loading } = useAuth();
  const { clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('identity'); // 'identity', 'analytics', 'tools'
  const [successMessage, setSuccessMessage] = useState('');
  const [associationData, setAssociationData] = useState(null);
  const [loadingAssoc, setLoadingAssoc] = useState(true);

  // Fetch de l'association en temps réel
  useEffect(() => {
    let unsubscribe = () => {};
    if (userData?.groupId) {
      try {
        const docRef = doc(db, 'associations', userData.groupId);
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setAssociationData(docSnap.data());
          }
          setLoadingAssoc(false);
        });
      } catch (error) {
        console.error("Erreur récupération association:", error);
        setLoadingAssoc(false);
      }
    } else {
      setLoadingAssoc(false);
    }
    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    // Vérification de l'URL pour le retour de Stripe
    const hashStr = window.location.hash;
    const hasSuccess = hashStr.includes('success=true');
    
    if (hasSuccess) {
      clearCart();
      setSuccessMessage('Paiement réussi ! Vos contenus ont été débloqués.');
      setActiveTab('tools'); // On redirige vers les outils débloqués
      // Nettoyer l'URL sans recharger la page
      window.history.replaceState(null, '', window.location.pathname + '#espace-client');
    }
  }, [clearCart]);

  if (loading || loadingAssoc) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p className="text-amber-900 font-bold">Chargement de votre espace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-amber-900 font-bold">Vous devez être connecté pour accéder à cet espace.</p>
        <button 
          onClick={onNavigateHome}
          className="px-4 py-2 bg-[#8b4513] text-white rounded-lg hover:bg-[#6e370f] transition-colors cursor-pointer"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Si l'onboarding n'est pas terminé, on affiche l'assistant de configuration
  if (!associationData?.onboardingCompleted) {
    return (
      <div className="pt-24 min-h-screen bg-[#fdf6e7]">
        <OnboardingWizard 
          groupId={userData?.groupId} 
          onComplete={() => setAssociationData(prev => ({ ...prev, onboardingCompleted: true }))} 
        />
      </div>
    );
  }

  // Vérification de l'accès aux analyses (doit avoir 'manager', 'vitrine', ou un plan qui les contient)
  const hasAnalyticsAccess = associationData?.ecosystemAccess?.hub !== false || associationData?.ecosystemAccess?.vitrine !== false;

  // Sécurité : si l'utilisateur est sur l'onglet analyses mais n'y a plus accès
  if (activeTab === 'analytics' && !hasAnalyticsAccess) {
    setActiveTab('tools');
  }

  return (
    <div className="pt-24 pb-12 min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Success Message Alert */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-green-800 font-bold text-sm uppercase tracking-wider">Succès</h3>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 relative z-10 -mb-[1px]">
        <button
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-wider text-sm transition-colors ${
            activeTab === 'identity' 
              ? 'bg-white text-[#8b4513] border-t-4 border-x border-[#8b4513] border-x-amber-900/10 border-b-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
              : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-white border-t-4 border-transparent border-b border-b-amber-900/10'
          }`}
        >
          <Settings className="w-4 h-4" />
          Identité
        </button>
        
        {hasAnalyticsAccess && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-wider text-sm transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-white text-[#8b4513] border-t-4 border-x border-[#8b4513] border-x-amber-900/10 border-b-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
                : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-white border-t-4 border-transparent border-b border-b-amber-900/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analyses
          </button>
        )}
        
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-wider text-sm transition-colors ${
            activeTab === 'tools' 
              ? 'bg-white text-[#8b4513] border-t-4 border-x border-[#8b4513] border-x-amber-900/10 border-b-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
              : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-white border-t-4 border-transparent border-b border-b-amber-900/10'
          }`}
        >
          <PackageOpen className="w-4 h-4" />
          Mes Outils
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-xl border border-amber-900/10 p-4 sm:p-8 relative z-0">
        
        {activeTab === 'identity' && (
          <TabIdentity 
            associationData={associationData} 
            groupId={userData?.groupId}
          />
        )}

        {activeTab === 'analytics' && hasAnalyticsAccess && (
          <TabAnalytics 
            associationData={associationData} 
            userData={userData} 
          />
        )}

        {activeTab === 'tools' && (
          <TabTools 
            associationData={associationData} 
            userData={userData} 
          />
        )}

      </div>
    </div>
  );
}
