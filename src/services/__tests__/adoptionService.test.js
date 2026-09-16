/**
 * Tests unitaires pour le service d'adoption transactionnelle (adoptionService.js)
 * Vérifie l'atomicité, la sécurité anti-auto-adoption, et la gestion sans débit des ressources déjà acquises.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adoptResource } from '../adoptionService.js';

describe('Service d\'Adoption Transactionnelle (adoptionService)', () => {
  it('lève une erreur si buyerGroupId ou resourceId est manquant', async () => {
    await assert.rejects(
      () => adoptResource({ collectionName: 'documents', resourceId: '', buyerGroupId: 'grp-1' }),
      /L'identifiant de la ressource est requis/
    );
    await assert.rejects(
      () => adoptResource({ collectionName: 'documents', resourceId: 'doc-1', buyerGroupId: '' }),
      /L'identifiant du groupe acquéreur est requis/
    );
  });

  it('rejette l\'adoption si l\'acquéreur tente d\'adopter sa propre création (auto-adoption)', async () => {
    const resData = { authorGroupId: 'mon-groupe', tier: 'sequence', axeValue: 20 };
    const buyerData = { contributionPoints: 100 };

    const mockRunner = async (db, cb) => cb({
      get: async (ref) => ({
        exists: () => true,
        data: () => (ref.path.includes('associations') ? buyerData : resData)
      })
    });

    await assert.rejects(
      () => adoptResource({
        collectionName: 'rhythms',
        resourceId: 'res-1',
        buyerGroupId: 'mon-groupe',
        options: { runTransaction: mockRunner }
      }),
      /Auto-adoption interdite/
    );
  });

  it('rejette l\'adoption si le solde de points d\'Axé est insuffisant', async () => {
    const resData = { authorGroupId: 'tiers-groupe', tier: 'combo', axeValue: 35 };
    const buyerData = { contributionPoints: 15 };

    const mockRunner = async (db, cb) => cb({
      get: async (ref) => ({
        exists: () => true,
        data: () => (ref.path.includes('associations') ? buyerData : resData)
      })
    });

    await assert.rejects(
      () => adoptResource({
        collectionName: 'choreographies',
        resourceId: 'res-combo',
        buyerGroupId: 'acheteur-pauvre',
        options: { runTransaction: mockRunner }
      }),
      /Solde d'Axé insuffisant/
    );
  });

  it('désactive le débit dans la transaction si la ressource est déjà débloquée', async () => {
    const resData = { authorGroupId: 'tiers-groupe', tier: 'varal', axeValue: 5 };
    const buyerData = { contributionPoints: 50, unlockedResources: ['doc-deja-debloque'] };
    const updates = new Map();
    let cloneCreated = false;

    const mockRunner = async (db, cb) => cb({
      get: async (ref) => ({
        exists: () => true,
        data: () => (ref.path.includes('associations') ? buyerData : resData)
      }),
      update: (ref, data) => updates.set(ref.path, data),
      set: () => { cloneCreated = true; }
    });

    const result = await adoptResource({
      collectionName: 'documents',
      resourceId: 'doc-deja-debloque',
      buyerGroupId: 'acheteur',
      options: { runTransaction: mockRunner }
    });

    assert.equal(result.success, true);
    assert.equal(result.alreadyUnlocked, true);
    assert.equal(result.cost, 0);
    assert.equal(updates.size, 0, 'Aucun débit ou écriture ne doit avoir lieu');
    assert.equal(cloneCreated, false, 'Aucun clone ne doit être créé pour un doublon');
  });

  it('exécute l\'adoption complète : débit, dividende, downloadsCount et clone avec filiation', async () => {
    const resData = {
      title: 'Tuto Alfaia',
      tier: 'lutherie',
      axeValue: 15,
      authorGroupId: 'groupe-artisan',
      authorName: 'Mestre Luthier',
      downloadsCount: 3
    };
    const buyerData = { name: 'Bateria Nova', contributionPoints: 40, unlockedResources: [] };
    const authorData = { name: 'Atelier Luthier', contributionPoints: 100 };

    const updates = new Map();
    let capturedClone = null;

    const mockRunner = async (db, cb) => cb({
      get: async (ref) => {
        if (ref.path.includes('documents/doc-lutherie')) return { exists: () => true, data: () => resData };
        if (ref.path.includes('associations/bateria-nova')) return { exists: () => true, data: () => buyerData };
        if (ref.path.includes('associations/groupe-artisan')) return { exists: () => true, data: () => authorData };
        return { exists: () => false };
      },
      update: (ref, data) => updates.set(ref.path, data),
      set: (ref, data) => { capturedClone = data; }
    });

    const result = await adoptResource({
      collectionName: 'documents',
      resourceId: 'doc-lutherie',
      buyerGroupId: 'bateria-nova',
      buyerName: 'Bateria Nova',
      options: { runTransaction: mockRunner }
    });

    assert.equal(result.success, true);
    assert.equal(result.cost, 15);
    assert.equal(result.dividend, 5);
    assert.equal(result.remainingPoints, 25);

    // 1. Débit de l'acquéreur
    const buyerUpdate = updates.get('associations/bateria-nova');
    assert.ok(buyerUpdate);
    assert.equal(buyerUpdate.contributionPoints, 25);

    // 2. Crédit du dividende à l'auteur
    const authorUpdate = updates.get('associations/groupe-artisan');
    assert.ok(authorUpdate);
    assert.equal(authorUpdate.contributionPoints, 105);

    // 3. Incrément downloadsCount
    const resUpdate = updates.get('documents/doc-lutherie');
    assert.ok(resUpdate);
    assert.equal(resUpdate.downloadsCount, 4);

    // 4. Métadonnées du clone privé
    assert.ok(capturedClone);
    assert.equal(capturedClone.authorGroupId, 'bateria-nova');
    assert.equal(capturedClone.authorName, 'Bateria Nova');
    assert.equal(capturedClone.originalSourceId, 'doc-lutherie');
    assert.equal(capturedClone.originalAuthorName, 'Mestre Luthier');
    assert.equal(capturedClone.isRemix, false);
    assert.equal(capturedClone.publicationStatus, 'draft');
    assert.equal(capturedClone.isPublic, false);
    assert.equal(capturedClone.rewardClaimed, false);
    assert.equal(capturedClone.downloadsCount, 0);
  });
});
