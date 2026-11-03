import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from './firebase.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function toMillis(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val < 1e11 ? val * 1000 : val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (typeof val.seconds === 'number') return val.seconds * 1000;
  const parsed = new Date(val).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function computeTenantUsageFromRaw({ groupId, users = [], documents = [], announcements = [], nowMs = Date.now() }) {
  const activeUsers = (users || []).filter((u) => u && u.statutActuel !== 'archived' && u.status !== 'archived' && !u.archived);
  const members = activeUsers.map((u) => {
    const tokens = Array.isArray(u.fcmTokens) ? u.fcmTokens.filter(Boolean) : [];
    const rawLast = u.lastActive ?? u.lastSeen ?? u.lastLoginAt ?? null;
    const lastActiveMs = toMillis(rawLast);
    const diffDays = lastActiveMs > 0 ? Math.max(0, (nowMs - lastActiveMs) / DAY_MS) : Infinity;
    const activityBucket = diffDays <= 7 ? '7d' : diffDays <= 30 ? '30d' : 'inactive';
    const displayName = u.displayName || u.nom || u.name || [u.prenom, u.nomFamille].filter(Boolean).join(' ') || u.email || 'Membre';
    return {
      id: u.id || u.uid || displayName,
      displayName,
      email: u.email || '',
      role: u.role || 'membre',
      instrumentPrincipal: u.instrumentPrincipal || u.instrument || (Array.isArray(u.instruments) ? u.instruments[0] : '') || 'Non spécifié',
      lastActive: rawLast,
      lastActiveMs,
      devicesCount: tokens.length,
      isPushReachable: tokens.length > 0,
      activityBucket
    };
  }).sort((a, b) => (b.lastActiveMs - a.lastActiveMs) || a.displayName.localeCompare(b.displayName));

  const totalActiveMembers = members.length;
  const pushReachableCount = members.filter((m) => m.isPushReachable).length;
  const activeMembers7d = members.filter((m) => m.activityBucket === '7d').length;
  const activeBucket30d = members.filter((m) => m.activityBucket === '30d').length;
  const activeMembers30d = activeMembers7d + activeBucket30d;
  const inactiveMembersCount = members.filter((m) => m.activityBucket === 'inactive').length;

  const mappedDocs = (documents || []).filter(Boolean).map((d) => {
    const viewsCount = Object.keys(d.lectures || {}).length || Number(d.viewCount || d.viewsCount || 0);
    const rawDate = d.createdAt || d.dateDepot || d.date || d.updatedAt || null;
    return {
      id: d.id || '',
      title: d.title || d.titre || d.nom || d.name || 'Document sans titre',
      category: d.category || d.categorie || d.corde || d.type || 'Varal',
      viewsCount,
      viewCount: viewsCount,
      createdAt: rawDate,
      createdAtMs: toMillis(rawDate)
    };
  });

  const varalTotalViews = mappedDocs.reduce((sum, d) => sum + d.viewsCount, 0);
  const topDocuments = [...mappedDocs].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 10);
  const zeroViewDocuments = mappedDocs.filter((d) => d.viewsCount === 0).sort((a, b) => b.createdAtMs - a.createdAtMs);
  const varalZeroViewDocsCount = zeroViewDocuments.length;

  const recentAnnouncements = (announcements || []).filter(Boolean).map((ann) => {
    const readersCount = Object.keys(ann.lectures || {}).length;
    const rawDate = ann.createdAt || ann.date || ann.publishedAt || null;
    return {
      id: ann.id || '',
      title: ann.title || ann.titre || ann.sujet || (ann.message || ann.contenu || '').slice(0, 80) || 'Annonce',
      author: ann.authorName || ann.auteurNom || ann.author || ann.auteur || 'Bureau',
      createdAt: rawDate,
      createdAtMs: toMillis(rawDate),
      readersCount,
      readRate: totalActiveMembers > 0 ? Math.min(100, Math.round((readersCount / totalActiveMembers) * 100)) : 0
    };
  }).sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 10);

  const avgReaders = recentAnnouncements.length > 0 ? recentAnnouncements.reduce((s, a) => s + a.readersCount, 0) / recentAnnouncements.length : 0;
  const megaphoneAvgReadRate = recentAnnouncements.length > 0 && totalActiveMembers > 0 ? Math.min(100, Math.round((avgReaders / totalActiveMembers) * 100)) : 0;

  const summaryStats = {
    pushReachableCount, activeMembers7d, activeMembers30d, totalActiveMembers,
    varalTotalViews, varalZeroViewDocsCount, megaphoneAvgReadRate,
    updatedAt: new Date(nowMs).toISOString()
  };

  return {
    groupId, ...summaryStats, activeBucket30d, inactiveMembersCount, summaryStats,
    members, topDocuments, zeroViewDocuments, recentAnnouncements
  };
}

export async function fetchDetailedTenantUsage(groupId, options = {}) {
  if (!groupId) throw new Error('Identifiant groupId requis pour fetchDetailedTenantUsage.');
  const targetDb = options.db || db;
  const fetchCol = options._fetchCollection || (async (colName) => {
    const snap = await getDocs(query(collection(targetDb, colName), where('groupId', '==', groupId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });
  const [users, documents, announcements] = await Promise.all([fetchCol('users'), fetchCol('documents'), fetchCol('announcements')]);
  return computeTenantUsageFromRaw({ groupId, users, documents, announcements, nowMs: options.nowMs });
}

export async function syncTenantUsageStatsToMaster(groupId, summaryStats, options = {}) {
  if (!groupId || !summaryStats) throw new Error('groupId et summaryStats sont requis.');
  const cleanStats = {
    pushReachableCount: Number(summaryStats.pushReachableCount || 0),
    activeMembers7d: Number(summaryStats.activeMembers7d || 0),
    activeMembers30d: Number(summaryStats.activeMembers30d || 0),
    totalActiveMembers: Number(summaryStats.totalActiveMembers || 0),
    varalTotalViews: Number(summaryStats.varalTotalViews || 0),
    varalZeroViewDocsCount: Number(summaryStats.varalZeroViewDocsCount || 0),
    megaphoneAvgReadRate: Number(summaryStats.megaphoneAvgReadRate || 0),
    updatedAt: summaryStats.updatedAt || new Date().toISOString()
  };
  if (options._saveMaster) await options._saveMaster(groupId, cleanStats);
  else await setDoc(doc(options.db || db, 'associations', groupId), { usageStats: cleanStats, updatedAt: serverTimestamp() }, { merge: true });
  return cleanStats;
}
