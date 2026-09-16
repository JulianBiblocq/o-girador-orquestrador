/**
 * Onglet d'administration du Terreiro : Modération, navette éditoriale et validation des ressources.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Loader2, Sparkles, Filter } from 'lucide-react';
import { approveResource, requestResourceRevision, rejectResource } from '../../services/resourceService.js';
import { inferDefaultTier } from '../../utils/axeTiers.js';
import EditorialReviewModal from './EditorialReviewModal.jsx';

const STATUS_BADGES = {
  pending_review: { label: 'En attente', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  published: { label: 'Publié', bg: 'bg-green-100 text-green-800 border-green-200' },
  needs_revision: { label: 'Ajustements demandés', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
  rejected: { label: 'Rejeté', bg: 'bg-red-100 text-red-800 border-red-200' },
  draft: { label: 'Brouillon', bg: 'bg-gray-100 text-gray-700 border-gray-200' }
};

export default function AdminModerationTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [processingId, setProcessingId] = useState(null);
  const [reviewModalItem, setReviewModalItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const collections = ['rhythms', 'choreographies', 'documents', 'instrument_models'];
      const snaps = await Promise.all(collections.map(c => getDocs(collection(db, c))));
      const fetched = [];

      snaps.forEach((snap, idx) => {
        const colName = collections[idx];
        snap.forEach(docSnap => {
          const d = docSnap.data();
          const pubStatus = d.publicationStatus || (d.isPublic ? 'published' : 'pending_review');
          fetched.push({
            id: docSnap.id,
            collection: colName,
            title: d.title || d.titre || d.nom || d.name || 'Sans titre',
            authorName: d.authorName || 'Inconnu',
            authorGroupId: d.authorGroupId || d.groupId,
            tier: d.tier || inferDefaultTier(colName, d.type),
            publicationStatus: pubStatus,
            isPublic: Boolean(d.isPublic),
            rewardClaimed: Boolean(d.rewardClaimed),
            createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now()
          });
        });
      });

      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setItems(fetched);
    } catch (err) {
      console.error("Erreur récupération modération:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleApprove = async (item) => {
    if (!window.confirm(`Approuver et publier "${item.title}" ? La prime d'Axé sera versée au groupe.`)) return;
    setProcessingId(item.id);
    try {
      await approveResource(item.collection, item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, publicationStatus: 'published', isPublic: true, rewardClaimed: true } : i));
    } catch (err) {
      alert("Erreur lors de l'approbation : " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!reviewModalItem) return;
    await requestResourceRevision(reviewModalItem.collection, reviewModalItem.id, reviewData);
    setItems(prev => prev.map(i => i.id === reviewModalItem.id ? { ...i, publicationStatus: 'needs_revision', isPublic: false } : i));
  };

  const handleReject = async (item) => {
    if (!window.confirm(`Voulez-vous vraiment rejeter ou retirer "${item.title}" ?`)) return;
    setProcessingId(item.id);
    try {
      await rejectResource(item.collection, item.id, 'Contenu rejeté par la modération.');
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, publicationStatus: 'rejected', isPublic: false } : i));
    } catch (err) {
      alert("Erreur lors du rejet : " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = items.filter(i => statusFilter === 'all' || i.publicationStatus === statusFilter);
  const pendingCount = items.filter(i => i.publicationStatus === 'pending_review').length;

  return (
    <div className="space-y-6">
      {/* Barre de filtrage */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('pending_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${statusFilter === 'pending_review' ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Clock className="w-3.5 h-3.5" /> En attente ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${statusFilter === 'published' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Publiés
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tous ({items.length})
          </button>
        </div>
        <span className="text-xs text-gray-500 font-medium">{filteredItems.length} ressource(s) affichée(s)</span>
      </div>

      {/* Tableau des ressources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-amber-900"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Chargement...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucune ressource dans cet état.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="p-4">Ressource</th>
                  <th className="p-4">Auteur</th>
                  <th className="p-4">Palier</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => {
                  const badge = STATUS_BADGES[item.publicationStatus] || STATUS_BADGES.draft;
                  const isBusy = processingId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 truncate max-w-xs">{item.title}</td>
                      <td className="p-4 text-gray-600 font-medium">{item.authorName}</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">{item.tier}</span></td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>{badge.label}</span></td>
                      <td className="p-4 text-right space-x-2">
                        {item.publicationStatus !== 'published' && (
                          <button onClick={() => handleApprove(item)} disabled={isBusy} className="px-2.5 py-1 rounded bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors" title="Approuver & Publier">
                            {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Approuver'}
                          </button>
                        )}
                        <button onClick={() => setReviewModalItem(item)} disabled={isBusy} className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs hover:bg-amber-100" title="Proposer un ajustement">
                          Ajuster
                        </button>
                        <button onClick={() => handleReject(item)} disabled={isBusy} className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100" title="Rejeter">
                          Rejeter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditorialReviewModal isOpen={Boolean(reviewModalItem)} onClose={() => setReviewModalItem(null)} item={reviewModalItem} onSubmit={handleReviewSubmit} />
    </div>
  );
}
