import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useLanguage } from '../../hooks/useLanguage';
import { calculateSubscriptionStatus } from '../../utils/subscriptionRights';
import AdminMetricsHeader from './AdminMetricsHeader';
import AssociationTable from './AssociationTable';
import AccessMatrixTable from './AccessMatrixTable';
import SoftLockSimulator from './SoftLockSimulator';
import AssociationModal from './AssociationModal';
import BugTrackerTab from './BugTrackerTab';
import AnalyticsTab from './AnalyticsTab';
import TicketsTab from './TicketsTab';
import ReviewsTab from './ReviewsTab';
import PacksManagerTab from './PacksManagerTab';
import CatalogueManagerTab from './CatalogueManagerTab';
import CmsManagerTab from './CmsManagerTab';
import AdminArtisans from './AdminArtisans';
import AdminConcours from './AdminConcours';
import AdminModerationTab from './AdminModerationTab';

export default function AdminDashboard() {
  const { associations, reload, addOrUpdateAssociation, removeAssociation } = useSubscriptions();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'matrix' | 'simulator'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssoc, setEditingAssoc] = useState(null);

  const handleOpenCreate = () => {
    setEditingAssoc(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (assoc) => {
    setEditingAssoc(assoc);
    setModalOpen(true);
  };

  const handleSaveAssoc = async (formData) => {
    await addOrUpdateAssociation(formData);
    setModalOpen(false);
  };

  const handleDeleteAssoc = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette association de l'écosystème ?")) {
      await removeAssociation(id);
    }
  };

  const handleQuickToggleApp = async (assoc, appKey) => {
    const updated = {
      ...assoc,
      appAccess: { ...assoc.appAccess, [appKey]: !assoc.appAccess?.[appKey] }
    };
    await addOrUpdateAssociation(updated);
  };

  const handleQuickToggleUniverse = async (assoc, uniKey) => {
    const updated = {
      ...assoc,
      universeAccess: { ...assoc.universeAccess, [uniKey]: !assoc.universeAccess?.[uniKey] }
    };
    await addOrUpdateAssociation(updated);
  };

  const handleQuickTogglePack = async (assoc, packId) => {
    const currentPacks = assoc.unlockedPacks || [];
    const newPacks = currentPacks.includes(packId)
      ? currentPacks.filter(p => p !== packId)
      : [...currentPacks, packId];
      
    const updated = {
      ...assoc,
      unlockedPacks: newPacks
    };
    await addOrUpdateAssociation(updated);
  };

  // Metrics
  const validAssociations = (associations || []).filter(Boolean);
  const totalAssocs = validAssociations.length;
  const activeCount = validAssociations.filter(a => calculateSubscriptionStatus(a.endDate, a.planType).status === 'active').length;
  const warningCount = validAssociations.filter(a => calculateSubscriptionStatus(a.endDate, a.planType).isWarning && !calculateSubscriptionStatus(a.endDate, a.planType).isExpired).length;
  const expiredCount = validAssociations.filter(a => calculateSubscriptionStatus(a.endDate, a.planType).isExpired).length;

  const filteredAssociations = validAssociations.filter(a => {
    const term = String(searchTerm || '').toLowerCase().trim();
    if (!term) return true;
    return (
      String(a?.name || a?.nom || '').toLowerCase().includes(term) ||
      String(a?.city || '').toLowerCase().includes(term) ||
      String(a?.contactEmail || '').toLowerCase().includes(term) ||
      String(a?.contactName || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen paper-texture py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Metrics Header */}
        <AdminMetricsHeader
          totalAssocs={totalAssocs}
          activeCount={activeCount}
          warningCount={warningCount}
          expiredCount={expiredCount}
          onOpenCreate={handleOpenCreate}
          onReload={reload}
        />

        {/* Tabs */}
        <div className="flex flex-wrap border-b-2 border-gray-200 gap-2 pb-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            {t('admin.tabs.list')} ({associations.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'matrix' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            {t('admin.tabs.matrix')}
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            {t('admin.tabs.simulator')}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'tickets' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            📬 Tickets
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'moderation' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            🛡️ Modération
          </button>
          <button
            onClick={() => setActiveTab('packs')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'packs' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            📦 Droits Add-ons
          </button>
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'catalogue' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            🛒 Éditeur Boutique
          </button>
          <button
            onClick={() => setActiveTab('bug-tracker')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'bug-tracker' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            {t('admin.tabs.bugs') || '🚨 Crashs Auto'}
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'cms' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            📝 Contenu Public
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            🌟 Avis
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            {t('admin.tabs.analytics') || '📊 Analytics'}
          </button>
          <button
            onClick={() => setActiveTab('artisans')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'artisans' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            🛠 Artisans (Terreiro)
          </button>
          <button
            onClick={() => setActiveTab('concours')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              activeTab === 'concours' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-md' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            🏆 Gamification
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'list' && (
          <AssociationTable
            associations={filteredAssociations}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteAssoc}
          />
        )}

        {activeTab === 'matrix' && (
          <AccessMatrixTable
            associations={associations}
            onToggleApp={handleQuickToggleApp}
            onToggleUniverse={handleQuickToggleUniverse}
          />
        )}

        {activeTab === 'simulator' && (
          <SoftLockSimulator />
        )}

        {activeTab === 'tickets' && (
          <TicketsTab />
        )}

        {activeTab === 'moderation' && (
          <AdminModerationTab />
        )}

        {activeTab === 'packs' && (
          <PacksManagerTab 
            associations={associations} 
            onTogglePack={handleQuickTogglePack} 
          />
        )}

        {activeTab === 'catalogue' && (
          <CatalogueManagerTab />
        )}

        {activeTab === 'bug-tracker' && (
          <BugTrackerTab />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}

        {activeTab === 'cms' && (
          <CmsManagerTab />
        )}

        {activeTab === 'artisans' && (
          <AdminArtisans />
        )}

        {activeTab === 'concours' && (
          <AdminConcours associations={associations} />
        )}

        {/* Modal */}
        <AssociationModal
          isOpen={modalOpen}
          initialData={editingAssoc}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAssoc}
        />

      </div>
    </div>
  );
}
