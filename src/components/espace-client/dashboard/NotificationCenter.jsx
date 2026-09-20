/**
 * Centre d'alertes du Cockpit Mestre :
 * Détecte en temps réel les nouveaux membres ainsi que les retours éditoriaux nécessitant des ajustements.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Bell, ArrowRight, CheckCircle2, MessageSquareText, Sparkles } from 'lucide-react';
import ResourceEditorModal from '../modals/ResourceEditorModal.jsx';
import { launchCrossApp } from '../../../utils/crossAppAuth';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';

const REASON_BADGES = {
  incomplete_technical: 'Précisions techniques',
  cultural_ref: 'Références culturelles',
  upgrade_eligible: 'Éligible palier supérieur',
  audio_quality: 'Qualité audio & calage'
};

export default function NotificationCenter({ userData }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [revisionItems, setRevisionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevisionItem, setSelectedRevisionItem] = useState(null);

  useEffect(() => {
    if (!userData?.groupId) {
      setLoading(false);
      return;
    }

    const unsubs = [];
    const groupId = userData.groupId;

    // 1. Écoute des nouveaux membres
    try {
      const qUsers = query(collection(db, 'users'), where('groupId', '==', groupId), where('isNew', '==', true));
      const unsubUsers = onSnapshot(qUsers, (snap) => {
        setPendingCount(snap.size);
      }, () => setPendingCount(0));
      unsubs.push(unsubUsers);
    } catch {}

    // 2. Écoute des fiches nécessitant une révision (rhythms, choreographies, documents)
    const collectionsToWatch = [
      { name: 'rhythms', label: 'Rythme' },
      { name: 'choreographies', label: 'Chorégraphie' },
      { name: 'documents', label: 'Document' }
    ];

    const revisionMap = new Map();

    collectionsToWatch.forEach(({ name, label }) => {
      try {
        const qRev = query(
          collection(db, name),
          where('authorGroupId', '==', groupId),
          where('publicationStatus', '==', 'needs_revision')
        );

        const unsub = onSnapshot(qRev, (snapshot) => {
          const docs = [];
          snapshot.forEach(doc => {
            docs.push({ id: doc.id, collectionName: name, typeLabel: label, ...doc.data() });
          });
          revisionMap.set(name, docs);

          // Agréger l'ensemble des créations en révision
          const allRevisions = [];
          revisionMap.forEach(list => allRevisions.push(...list));
          setRevisionItems(allRevisions);
          setLoading(false);
        }, () => setLoading(false));

        unsubs.push(unsub);
      } catch {
        setLoading(false);
      }
    });

    // Nettoyage complet de l'ensemble des écouteurs Firestore
    return () => {
      unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [userData?.groupId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse min-h-[80px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasRevisions = revisionItems.length > 0;
  const hasMembers = pendingCount > 0;

  if (!hasRevisions && !hasMembers) {
    return (
      <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm">Tout est à jour</h3>
            <p className="text-xs text-emerald-700/80">Aucune action urgente requise.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Alerte retours éditoriaux (Prioritaire) */}
      {hasRevisions && revisionItems.map(item => {
        const reasonKey = item.editorialReview?.reasonCategory;
        const reasonLabel = REASON_BADGES[reasonKey] || 'Ajustements suggérés';
        const title = item.title || item.titre || item.nom || 'Votre création';

        return (
          <div key={item.id} className="bg-amber-50 rounded-xl border-l-4 border-amber-500 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 shrink-0">
                <MessageSquareText className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-amber-950 text-sm md:text-base">
                    Des ajustements sont suggérés sur « {title} »
                  </h3>
                  <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    {reasonLabel}
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 line-clamp-1">
                  {item.editorialReview?.adminMessage || "L'équipe éditoriale a laissé des conseils bienveillants pour finaliser la fiche."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedRevisionItem(item)}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white font-bold text-sm rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
            >
              <span>Consulter les retours</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      {/* Alerte nouveaux membres */}
      {hasMembers && (
        <div className="bg-orange-50 rounded-xl border-l-4 border-orange-500 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-orange-900 text-sm md:text-base flex items-center gap-2">
                ⚠️ {pendingCount} nouveau{pendingCount > 1 ? 'x' : ''} membre{pendingCount > 1 ? 's' : ''} en attente
              </h3>
              <p className="text-xs text-orange-800/80">Une action de votre part est requise pour valider ces inscriptions.</p>
            </div>
          </div>
          <a
            href={getEcosystemUrl('organizador', '/membres')}
            onClick={(e) => {
              e.preventDefault();
              launchCrossApp(getEcosystemUrl('organizador', '/membres'), { appKey: 'organizador', appLabel: "Organizad'Or" });
            }}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold text-sm rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <span>Gérer les accès</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Modale d'édition et resoumission */}
      <ResourceEditorModal
        isOpen={Boolean(selectedRevisionItem)}
        onClose={() => setSelectedRevisionItem(null)}
        resource={selectedRevisionItem}
        collectionName={selectedRevisionItem?.collectionName || 'rhythms'}
        onResubmitted={() => {}}
      />
    </div>
  );
}
