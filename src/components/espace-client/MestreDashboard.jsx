import React from 'react';
import NotificationCenter from './dashboard/NotificationCenter';
import GlobalHealthStats from './dashboard/GlobalHealthStats';
import SubscriptionPanel from './dashboard/SubscriptionPanel';

export default function MestreDashboard({ associationData, userData, onNavigateHome, setActiveTab }) {
  const isFreemium = !associationData?.unlockedPacks || associationData.unlockedPacks.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header du Dashboard */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-[#4a2e1b] font-cordel mb-2">
          Tour de Contrôle Mestre
        </h2>
        {isFreemium && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-3 shadow-sm">
            <span className="text-2xl mt-0.5">🎉</span>
            <div>
              <p className="font-bold">Félicitations !</p>
              <p className="text-sm">Votre groupe est désormais visible sur la carte mondiale de la communauté.</p>
            </div>
          </div>
        )}
        <p className="text-[#8b4513] text-sm md:text-base">
          Bienvenue dans votre espace centralisé. Pilotez votre identité, vos membres et vos abonnements depuis ce cockpit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Zone 1 : Notifications Système */}
        <div className="lg:col-span-3">
          <NotificationCenter userData={userData} />
        </div>

        {/* ZONE 2 : Mon Identité & Santé Globale */}
        <div className="lg:col-span-2">
          <GlobalHealthStats userData={userData} associationData={associationData} />
        </div>

        {/* ZONE 3 : Mon Abonnement & Boutique */}
        <div className="lg:col-span-1">
          <SubscriptionPanel associationData={associationData} setActiveTab={setActiveTab} onNavigateHome={onNavigateHome} />
        </div>

      </div>

    </div>
  );
}
