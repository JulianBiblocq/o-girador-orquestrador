/**
 * Composant : Jauge de Quota de Stockage (Charte Cordel / Bois Vieilli)
 * Écoute en temps réel l'utilisation du stockage Cloud et affiche la progression.
 */

import React, { useState, useEffect } from 'react';
import { HardDrive, RotateCw, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../services/firebase';
import {
  formatStorageBytes,
  getStorageUsagePercent,
  inferQuotaFromPacks,
  STORAGE_TIERS
} from '../../../utils/storageTiers';

export default function StorageQuotaGauge({ groupId, associationData, onUpgrade, className = '' }) {
  const rawGroupId = String(groupId || associationData?.groupId || '').trim();
  const canonicalGroupId = rawGroupId.toLowerCase();
  const effectiveGroupId = canonicalGroupId === 'samambaia' ? 'Samambaia' : rawGroupId;
  
  const [storageData, setStorageData] = useState({
    usedBytes: Number(associationData?.storage?.usedBytes || 0),
    quotaBytes: Number(associationData?.storage?.quotaBytes || inferQuotaFromPacks(associationData?.unlockedPacks)),
    lastCalculatedAt: associationData?.storage?.lastCalculatedAt || null
  });
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Synchronisation immédiate avec les props d'associationData
  useEffect(() => {
    if (associationData) {
      if (associationData.storage) {
        setStorageData(prev => ({
          ...prev,
          usedBytes: Number(associationData.storage.usedBytes || 0),
          quotaBytes: Number(associationData.storage.quotaBytes || inferQuotaFromPacks(associationData.unlockedPacks)),
          lastCalculatedAt: associationData.storage.lastCalculatedAt
        }));
      } else if (associationData.unlockedPacks) {
        setStorageData(prev => ({
          ...prev,
          quotaBytes: inferQuotaFromPacks(associationData.unlockedPacks)
        }));
      }
    }
  }, [associationData]);

  // Écoute en temps réel du document association
  useEffect(() => {
    if (!effectiveGroupId) return;

    let unsubAlt = () => {};
    const unsub = onSnapshot(doc(db, 'associations', effectiveGroupId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.storage) {
          setStorageData({
            usedBytes: Number(data.storage.usedBytes || 0),
            quotaBytes: Number(data.storage.quotaBytes || inferQuotaFromPacks(data.unlockedPacks)),
            lastCalculatedAt: data.storage.lastCalculatedAt
          });
        } else {
          setStorageData(prev => ({
            ...prev,
            quotaBytes: inferQuotaFromPacks(data.unlockedPacks || associationData?.unlockedPacks)
          }));
        }
      } else {
        const altId = effectiveGroupId.toLowerCase();
        if (altId !== effectiveGroupId) {
          unsubAlt = onSnapshot(doc(db, 'associations', altId), (altSnap) => {
            if (altSnap.exists()) {
              const data = altSnap.data();
              if (data.storage) {
                setStorageData({
                  usedBytes: Number(data.storage.usedBytes || 0),
                  quotaBytes: Number(data.storage.quotaBytes || inferQuotaFromPacks(data.unlockedPacks)),
                  lastCalculatedAt: data.storage.lastCalculatedAt
                });
              }
            }
          });
        }
      }
    }, (err) => {
      console.warn("[StorageQuotaGauge] Erreur d'écoute Firestore :", err.message);
    });

    return () => {
      unsub();
      unsubAlt();
    };
  }, [effectiveGroupId, associationData?.unlockedPacks]);

  // Recalcul manuel déclenché par l'administrateur ou le Mestre
  const handleRecalculate = async () => {
    if (!effectiveGroupId || isRecalculating) return;
    setIsRecalculating(true);
    setFeedbackMsg('');

    try {
      const calcFn = httpsCallable(functions, 'calculateAssociationStorageUsage');
      const res = await calcFn({ groupId: effectiveGroupId });
      if (res.data?.success) {
        setFeedbackMsg('Actualisé');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      console.error("[StorageQuotaGauge] Échec du recalcul :", err);
      setFeedbackMsg('Erreur');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleUpgradeClick = () => {
    if (typeof onUpgrade === 'function') {
      onUpgrade();
    } else {
      window.location.hash = '#boutique';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  const used = storageData.usedBytes || 0;
  const quota = storageData.quotaBytes || STORAGE_TIERS.STANDARD;
  const percent = getStorageUsagePercent(used, quota);

  // Configuration visuelle selon les seuils : < 75% Vert, > 75% Ambre, > 90% Rouge
  let barColor = 'bg-emerald-600';
  let badgeColor = 'bg-emerald-100/70 text-emerald-900 border-emerald-300';
  let isNearLimit = percent >= 85;

  if (percent >= 90) {
    barColor = 'bg-rose-600 animate-pulse';
    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
  } else if (percent >= 75) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  }

  return (
    <div className={`bg-[#fdfaf3] border-2 border-amber-900/15 rounded-2xl p-5 shadow-sm relative overflow-hidden ${className}`}>
      {/* En-tête : Titre & Action de rafraîchissement */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-900/20 flex items-center justify-center text-[#8b4513] shadow-inner">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-cordel text-base md:text-lg font-bold text-[#4a2e1b] leading-tight">
              Espace Disque & Quota
            </h4>
            <p className="text-xs text-[#8b4513]/80">Documents, audios, vidéos & médias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedbackMsg && (
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> {feedbackMsg}
            </span>
          )}
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            title="Recalculer l'espace disque"
            className="p-1.5 rounded-lg border border-amber-900/15 bg-white text-[#8b4513] hover:bg-amber-50 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {percent}%
          </span>
        </div>
      </div>

      {/* Barre de progression (Rainure Cordel) */}
      <div className="w-full bg-[#ebd9c1] rounded-full h-3.5 p-0.5 shadow-inner border border-amber-950/10 mb-2.5">
        <div
          className={`h-full rounded-full transition-all duration-500 shadow-sm ${barColor}`}
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>

      {/* Libellé d'utilisation */}
      <div className="flex items-center justify-between text-xs text-[#6e370f] font-medium">
        <span>
          <strong className="text-[#4a2e1b] font-bold">{formatStorageBytes(used)}</strong> utilisés sur{' '}
          <strong className="text-[#4a2e1b] font-bold">{formatStorageBytes(quota)}</strong>
        </span>
        {storageData.lastCalculatedAt && (
          <span className="text-[11px] text-amber-800/70 hidden sm:inline">
            Synchro active
          </span>
        )}
      </div>

      {/* Encart & Bouton d'action incitatif si l'espace dépasse 85% */}
      {isNearLimit && (
        <div className="mt-4 pt-3 border-t border-amber-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-500/10 -mx-5 -mb-5 p-4 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-[#8b4513]">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Capacité presque atteinte. Augmentez votre espace pour continuer à sauvegarder vos créations.</span>
          </div>
          <button
            onClick={handleUpgradeClick}
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#8b4513] hover:bg-[#6e370f] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-colors cursor-pointer"
          >
            Augmenter mon quota de stockage
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
