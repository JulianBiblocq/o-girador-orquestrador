import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toMillis,
  computeTenantUsageFromRaw,
  fetchDetailedTenantUsage,
  syncTenantUsageStatsToMaster
} from '../orquestradorUsageService.js';

const NOW_MS = new Date('2026-11-03T12:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

describe('Service Analytique Orquestrador (orquestradorUsageService)', () => {
  it('convertit différents formats de date en millisecondes via toMillis', () => {
    assert.equal(toMillis(null), 0);
    assert.equal(toMillis(NOW_MS), NOW_MS);
    assert.equal(toMillis({ seconds: 1700000000 }), 1700000000000);
    assert.equal(toMillis({ toMillis: () => NOW_MS }), NOW_MS);
    assert.equal(toMillis('2026-11-03T12:00:00.000Z'), NOW_MS);
  });

  it('calcule correctement les compteurs membres, Push, Varal et Mégaphone (hors archivés)', async () => {
    const mockUsers = [
      {
        id: 'u1',
        displayName: 'Alice Alfaia',
        role: 'mestre',
        instrumentPrincipal: 'Alfaia',
        statutActuel: 'active',
        fcmTokens: ['tok-1', 'tok-2'],
        lastActive: NOW_MS - 2 * DAY_MS // 7d
      },
      {
        id: 'u2',
        displayName: 'Bruno Gonguê',
        role: 'membre',
        instrumentPrincipal: 'Gonguê',
        statutActuel: 'active',
        fcmTokens: [],
        lastActive: NOW_MS - 15 * DAY_MS // 30d
      },
      {
        id: 'u3',
        displayName: 'CarlaCaixa',
        role: 'membre',
        instrumentPrincipal: 'Caixa',
        statutActuel: 'active',
        fcmTokens: ['tok-3'],
        lastActive: NOW_MS - 45 * DAY_MS // inactive
      },
      {
        id: 'u4',
        displayName: 'David Archivé',
        statutActuel: 'archived',
        fcmTokens: ['tok-4'],
        lastActive: NOW_MS - 1 * DAY_MS
      }
    ];

    const mockDocs = [
      { id: 'd1', title: 'Toada Luanda', category: 'Toada', lectures: { u1: true, u2: true, u3: true } },
      { id: 'd2', title: 'Histoire du Maracatu', category: 'Culture', viewCount: 2 },
      { id: 'd3', title: 'Règlement Intérieur', category: 'Admin', lectures: {}, createdAt: NOW_MS - 5 * DAY_MS }
    ];

    const mockAnnouncements = [
      { id: 'a1', title: 'Répétition Générale', author: 'Mestre', lectures: { u1: true, u2: true, u3: true }, createdAt: NOW_MS - DAY_MS },
      { id: 'a2', title: 'Sortie Carnaval', author: 'Bureau', lectures: { u1: true }, createdAt: NOW_MS - 3 * DAY_MS }
    ];

    const result = await fetchDetailedTenantUsage('samambaia', {
      nowMs: NOW_MS,
      _fetchCollection: async (colName) => {
        if (colName === 'users') return mockUsers;
        if (colName === 'documents') return mockDocs;
        if (colName === 'announcements') return mockAnnouncements;
        return [];
      }
    });

    assert.equal(result.totalActiveMembers, 3);
    assert.equal(result.pushReachableCount, 2);
    assert.equal(result.activeMembers7d, 1);
    assert.equal(result.activeBucket30d, 1);
    assert.equal(result.activeMembers30d, 2);
    assert.equal(result.inactiveMembersCount, 1);

    assert.equal(result.members[0].id, 'u1');
    assert.equal(result.members[0].devicesCount, 2);
    assert.equal(result.members[0].activityBucket, '7d');
    assert.equal(result.members[1].activityBucket, '30d');
    assert.equal(result.members[2].activityBucket, 'inactive');

    assert.equal(result.varalTotalViews, 5);
    assert.equal(result.varalZeroViewDocsCount, 1);
    assert.equal(result.topDocuments[0].id, 'd1');
    assert.equal(result.topDocuments[0].viewsCount, 3);
    assert.equal(result.zeroViewDocuments.length, 1);
    assert.equal(result.zeroViewDocuments[0].id, 'd3');

    assert.equal(result.recentAnnouncements.length, 2);
    assert.equal(result.megaphoneAvgReadRate, 67);
  });

  it('synchronise usageStats sur associations/{groupId} via syncTenantUsageStatsToMaster', async () => {
    let savedGroup = null;
    let savedStats = null;

    const clean = await syncTenantUsageStatsToMaster(
      'samambaia',
      {
        pushReachableCount: 12,
        activeMembers7d: 8,
        activeMembers30d: 14,
        totalActiveMembers: 16,
        varalTotalViews: 90,
        varalZeroViewDocsCount: 2,
        megaphoneAvgReadRate: 75,
        updatedAt: '2026-11-03T12:00:00.000Z'
      },
      {
        _saveMaster: async (gId, stats) => {
          savedGroup = gId;
          savedStats = stats;
        }
      }
    );

    assert.equal(savedGroup, 'samambaia');
    assert.equal(savedStats.pushReachableCount, 12);
    assert.equal(savedStats.varalZeroViewDocsCount, 2);
    assert.equal(clean.megaphoneAvgReadRate, 75);
  });
});

