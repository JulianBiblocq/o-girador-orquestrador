import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { CheckCircle2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import ImportConfirmModal from './ImportConfirmModal';
import { Loader2 } from 'lucide-react';

import MestreTopBar from './MestreTopBar';
import MestreDashboard from './MestreDashboard';
import SequencerView from './views/SequencerView';
import DancadorView from './views/DancadorView';
import OrganizadorView from './views/OrganizadorView';
import VitrineView from './views/VitrineView';
import AddonsStore from './views/AddonsStore';
import TerreiroView from './views/TerreiroView';
import ProfileView from './views/ProfileView';

export default function EspaceClient({ onNavigateHome }) {
  const { currentUser, userData, loading, isProvisioning, loginWithGoogle } = useAuth();
  const { clearCart } = useCart();
  const [successMessage, setSuccessMessage] = useState('');
  const [associationData, setAssociationData] = useState(null);
  const [loadingAssoc, setLoadingAssoc] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const [importParams, setImportParams] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

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
      // Nettoyer l'URL sans recharger la page
      window.history.replaceState(null, '', window.location.pathname + '#espace-client');
    }

    // Vérification de l'URL pour l'import de création
    const searchParams = new URLSearchParams(window.location.search);
    const importId = searchParams.get('import_id');
    const type = searchParams.get('type');
    
    if (importId && type) {
      setImportParams({ import_id: importId, type });
      setShowImportModal(true);
    }
  }, [clearCart]);

  // Redirection automatique vers le profil pour les nouveaux inscrits
  useEffect(() => {
    if (associationData && !hasRedirected) {
      if (!associationData.name && !associationData.nom) {
        setActiveTab('profile');
      }
      setHasRedirected(true);
    }
  }, [associationData, hasRedirected]);

  if (loading || loadingAssoc || isProvisioning) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
        {isProvisioning && <Loader2 className="w-8 h-8 text-[#8b4513] animate-spin" />}
        <p className="text-amber-900 font-bold">
          {isProvisioning ? "Création de votre espace en cours..." : "Chargement de votre espace..."}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center px-4">
        
        <h2 className="text-2xl font-black text-[#4a2e1b] font-cordel">
          Accès Restreint
        </h2>
        <p className="text-[#8b4513]">
          {importParams 
            ? "Créez votre compte gratuit ou connectez-vous pour utiliser ce morceau dans votre répertoire." 
            : "Vous devez être connecté pour accéder à cet espace."}
        </p>
        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continuer avec Google
        </button>
        <button 
          onClick={onNavigateHome}
          className="text-gray-500 hover:text-gray-800 text-sm font-bold mt-4"
        >
          Retour à l'accueil
        </button>
      </div>
    );
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

      {/* Welcome message for new users */}
      {associationData && !associationData.name && !associationData.nom && activeTab === 'profile' && !successMessage && (
        <div className="mb-6 bg-[#d2691e]/10 border-l-4 border-[#d2691e] p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#8b4513] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[#8b4513] font-bold text-sm uppercase tracking-wider">Bienvenue à bord !</h3>
            <p className="text-[#8b4513]/80 text-sm">Votre espace Mestre a été créé avec succès. Pour finaliser votre inscription, veuillez renseigner le nom de votre association.</p>
          </div>
        </div>
      )}

      {/* App Switcher (Top Bar de la Tour de Contrôle) */}
      <MestreTopBar 
        associationData={associationData} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <ImportConfirmModal 
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          // Nettoyer l'URL
          window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        }}
        importParams={importParams}
        associationData={associationData}
        onSuccess={() => {
          setSuccessMessage('Création importée avec succès dans votre répertoire !');
        }}
      />

      {/* Main Content Area (Cockpit Mestre) */}
      <div className="bg-transparent mt-2">
        {activeTab === 'dashboard' && (
          <MestreDashboard 
            associationData={associationData} 
            userData={userData} 
            onNavigateHome={onNavigateHome}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'sequenceur' && (
          <SequencerView userData={userData} onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'dancador' && (
          <DancadorView userData={userData} onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'manager' && (
          <OrganizadorView userData={userData} onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'vitrine' && (
          <VitrineView userData={userData} onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'boutique' && (
          <AddonsStore associationData={associationData} onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'terreiro' && (
          <TerreiroView associationData={associationData} userData={userData} onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'profile' && (
          <ProfileView associationData={associationData} userData={userData} onBack={() => setActiveTab('dashboard')} />
        )}
      </div>
    </div>
  );
}
