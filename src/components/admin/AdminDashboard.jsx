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
        <div className="flex border-b-2 border-[#4a2e1b]/30 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            {t('admin.tabs.list')} ({associations.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'matrix' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            {t('admin.tabs.matrix')}
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            {t('admin.tabs.simulator')}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'tickets' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            📬 Tickets
          </button>
          <button
            onClick={() => setActiveTab('bug-tracker')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'bug-tracker' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            {t('admin.tabs.bugs') || '🚨 Crashs Auto'}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            🌟 Avis
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#8b4513] text-[#fdf6e7] shadow-lg' : 'bg-[#f4e8cf] text-[#4a2e1b]'
            }`}
          >
            {t('admin.tabs.analytics') || '📊 Analytics'}
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

        {activeTab === 'bug-tracker' && (
          <BugTrackerTab />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
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
