/**
 * Tests unitaires pour le service de ressources et le garde-fou anti-plagiat (resourceService.js)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkPaternityGuardrail,
  publishResource,
  approveResource,
  requestResourceRevision,
  rejectResource,
  resubmitResource
} from '../resourceService.js';

describe('Service de Publication & Anti-Plagiat (resourceService)', () => {

  describe('checkPaternityGuardrail', () => {

    it('autorise la publication d\'une œuvre originale du groupe auteur', () => {
      const ownResource = {
        authorGroupId: 'mon-groupe',
        authorName: 'Maracatu Sol',
        originalSourceId: null
      };

      const result = checkPaternityGuardrail(ownResource, 'mon-groupe', false);
      assert.equal(result.isDerivative, false);
    });

    it('bloque la publication si la ressource dérive d\'un document source d\'un groupe tiers sans Remix', () => {
      const importedResource = {
        authorGroupId: 'mon-groupe',
        authorName: 'Maracatu Sol',
        originalSourceId: 'source-123',
        originalAuthorName: 'Bateria Pioneira'
      };

      const sourceDoc = {
        id: 'source-123',
        authorGroupId: 'groupe-tiers',
        authorName: 'Bateria Pioneira'
      };

      assert.throws(() => {
        checkPaternityGuardrail(importedResource, 'mon-groupe', false, sourceDoc);
      }, /Publication refusée : Cette ressource dérive d'un contenu créé par un tiers \(Bateria Pioneira\)/);
    });

    it('autorise la publication si l\'utilisateur choisit explicitement l\'option Remix', () => {
      const importedResource = {
        authorGroupId: 'mon-groupe',
        authorName: 'Maracatu Sol',
        originalSourceId: 'source-123',
        originalAuthorName: 'Bateria Pioneira'
      };

      const sourceDoc = {
        id: 'source-123',
        authorGroupId: 'groupe-tiers',
        authorName: 'Bateria Pioneira'
      };

      const result = checkPaternityGuardrail(importedResource, 'mon-groupe', true, sourceDoc);
      assert.equal(result.isDerivative, true);
      assert.equal(result.sourceAuthorName, 'Bateria Pioneira');
    });

    it('bloque la republication directe d\'un document appartenant à un tiers sans Remix', () => {
      const thirdPartyResource = {
        authorGroupId: 'autre-association',
        authorName: 'Mestre Carlos',
        originalSourceId: null
      };

      assert.throws(() => {
        checkPaternityGuardrail(thirdPartyResource, 'mon-groupe', false);
      }, /Publication refusée/);
    });

    it('autorise la republication d\'une ressource tierce avec asRemix=true', () => {
      const thirdPartyResource = {
        id: 'res-999',
        authorGroupId: 'autre-association',
        authorName: 'Mestre Carlos',
        originalSourceId: null
      };

      const result = checkPaternityGuardrail(thirdPartyResource, 'mon-groupe', true);
      assert.equal(result.isDerivative, true);
      assert.equal(result.sourceAuthorName, 'Mestre Carlos');
    });

  });

  describe('publishResource', () => {

    it('lève une erreur si currentGroupId est manquant', async () => {
      await assert.rejects(
        async () => {
          await publishResource({
            collectionName: 'rhythms',
            resourceId: 'doc-1',
            currentGroupId: ''
          });
        },
        /currentGroupId' est requis/
      );
    });

    it('lève une erreur si la ressource est introuvable', async () => {
      const fakeGet = async () => null;

      await assert.rejects(
        async () => {
          await publishResource({
            collectionName: 'rhythms',
            resourceId: 'doc-inconnu',
            currentGroupId: 'mon-groupe',
            _getResource: fakeGet
          });
        },
        /Ressource introuvable/
      );
    });

    it('publie une œuvre originale en pending_review avec synchronisation de isPublic=false', async () => {
      const existingDoc = {
        id: 'rythme-1',
        authorGroupId: 'mon-groupe',
        authorName: 'Association Soleil',
        tier: 'sequence',
        publicationStatus: 'draft',
        isPublic: false,
        originalSourceId: null
      };

      let capturedUpdate = null;
      const fakeGet = async () => existingDoc;
      const fakeUpdate = async (coll, id, update) => {
        capturedUpdate = update;
        return { ...existingDoc, ...update };
      };

      const result = await publishResource({
        collectionName: 'rhythms',
        resourceId: 'rythme-1',
        currentGroupId: 'mon-groupe',
        asRemix: false,
        targetStatus: 'pending_review',
        _getResource: fakeGet,
        _updateResource: fakeUpdate
      });

      assert.equal(capturedUpdate.publicationStatus, 'pending_review');
      assert.equal(capturedUpdate.isPublic, false);
      assert.equal(capturedUpdate.tier, 'sequence');
      assert.equal(capturedUpdate.axeValue, 20);
      assert.equal(result.publicationStatus, 'pending_review');
    });

    it('publie directement avec targetStatus=published et synchronise isPublic=true', async () => {
      const existingDoc = {
        id: 'rythme-1',
        authorGroupId: 'mon-groupe',
        authorName: 'Association Soleil',
        tier: 'sequence',
        publicationStatus: 'draft',
        isPublic: false,
        originalSourceId: null
      };

      let capturedUpdate = null;
      const fakeGet = async () => existingDoc;
      const fakeUpdate = async (coll, id, update) => {
        capturedUpdate = update;
        return { ...existingDoc, ...update };
      };

      await publishResource({
        collectionName: 'rhythms',
        resourceId: 'rythme-1',
        currentGroupId: 'mon-groupe',
        asRemix: false,
        targetStatus: 'published',
        _getResource: fakeGet,
        _updateResource: fakeUpdate
      });

      assert.equal(capturedUpdate.publicationStatus, 'published');
      assert.equal(capturedUpdate.isPublic, true);
    });

    it('force isRemix=true et scelle originalSourceId et originalAuthorName lors d\'un Remix', async () => {
      const derivedDoc = {
        id: 'doc-derivation',
        authorGroupId: 'mon-groupe',
        authorName: 'Notre Groupe',
        originalSourceId: 'doc-original-42',
        originalAuthorName: 'Mestre Ancestral',
        tier: 'varal'
      };

      const originalDoc = {
        id: 'doc-original-42',
        authorGroupId: 'groupe-fondateur',
        authorName: 'Mestre Ancestral'
      };

      let capturedUpdate = null;
      const fakeGet = async (coll, id) => (id === 'doc-derivation' ? derivedDoc : originalDoc);
      const fakeUpdate = async (coll, id, update) => {
        capturedUpdate = update;
        return { ...derivedDoc, ...update };
      };

      await publishResource({
        collectionName: 'documents',
        resourceId: 'doc-derivation',
        currentGroupId: 'mon-groupe',
        asRemix: true,
        _getResource: fakeGet,
        _updateResource: fakeUpdate
      });

      assert.equal(capturedUpdate.isRemix, true);
      assert.equal(capturedUpdate.originalSourceId, 'doc-original-42');
      assert.equal(capturedUpdate.originalAuthorName, 'Mestre Ancestral');
    });

  });

  describe('approveResource', () => {

    it('approuve et crédite la prime d\'Axé de manière atomique lors d\'une première publication', async () => {
      const resourceData = {
        tier: 'sequence', // prime = 25
        authorGroupId: 'assoc-77',
        publicationStatus: 'pending_review',
        isPublic: false,
        rewardClaimed: false
      };

      const assocData = {
        contributionPoints: 100
      };

      const capturedUpdates = new Map();

      const mockRunner = async (targetDb, callback) => {
        const mockTx = {
          get: async (ref) => {
            const path = ref.path || '';
            if (path.includes('rhythms/res-1')) {
              return { exists: () => true, data: () => resourceData };
            }
            if (path.includes('associations/assoc-77')) {
              return { exists: () => true, data: () => assocData };
            }
            return { exists: () => false };
          },
          update: (ref, payload) => {
            capturedUpdates.set(ref.path, payload);
          }
        };
        return await callback(mockTx);
      };

      const result = await approveResource('rhythms', 'res-1', {
        runTransaction: mockRunner
      });

      assert.equal(result.publicationStatus, 'published');
      assert.equal(result.isPublic, true);
      assert.equal(result.rewardClaimed, true);
      assert.equal(result.pointsAwarded, 25);

      // Vérifie l'incrémentation des points d'Axé
      const assocUpdate = capturedUpdates.get('associations/assoc-77');
      assert.ok(assocUpdate, 'L\'association doit être mise à jour');
      assert.equal(assocUpdate.contributionPoints, 125); // 100 + 25

      // Vérifie la mise à jour de la ressource
      const resourceUpdate = capturedUpdates.get('rhythms/res-1');
      assert.ok(resourceUpdate, 'La ressource doit être mise à jour');
      assert.equal(resourceUpdate.publicationStatus, 'published');
      assert.equal(resourceUpdate.isPublic, true);
      assert.equal(resourceUpdate.rewardClaimed, true);
    });

    it('n\'octroie pas de points si la récompense a déjà été réclamée (rewardClaimed: true)', async () => {
      const resourceData = {
        tier: 'sequence',
        authorGroupId: 'assoc-77',
        publicationStatus: 'needs_revision',
        isPublic: false,
        rewardClaimed: true
      };

      const capturedUpdates = new Map();

      const mockRunner = async (targetDb, callback) => {
        const mockTx = {
          get: async (ref) => {
            if (ref.path.includes('rhythms/res-2')) {
              return { exists: () => true, data: () => resourceData };
            }
            return { exists: () => false };
          },
          update: (ref, payload) => {
            capturedUpdates.set(ref.path, payload);
          }
        };
        return await callback(mockTx);
      };

      const result = await approveResource('rhythms', 'res-2', {
        runTransaction: mockRunner
      });

      assert.equal(result.pointsAwarded, 0);
      assert.equal(capturedUpdates.has('associations/assoc-77'), false);
    });

  });

  describe('requestResourceRevision', () => {

    it('bascule le statut à needs_revision, isPublic=false et renseigne editorialReview', async () => {
      const currentDoc = {
        id: 'doc-rev',
        title: 'Chorégraphie Test',
        publicationStatus: 'pending_review',
        isPublic: false,
        tier: 'sequence'
      };

      let capturedUpdate = null;
      const fakeGet = async () => currentDoc;
      const fakeUpdate = async (coll, id, update) => {
        capturedUpdate = update;
        return { ...currentDoc, ...update };
      };

      const result = await requestResourceRevision(
        'choreographies',
        'doc-rev',
        {
          reasonCategory: 'incomplete_technical',
          adminMessage: 'Manque les repères au sol.',
          suggestedTier: 'combo'
        },
        {
          _getResource: fakeGet,
          _updateResource: fakeUpdate
        }
      );

      assert.equal(capturedUpdate.publicationStatus, 'needs_revision');
      assert.equal(capturedUpdate.isPublic, false);
      assert.equal(capturedUpdate.tier, 'combo');
      assert.equal(capturedUpdate.axeValue, 35); // combo = 35
      assert.equal(capturedUpdate.editorialReview.reasonCategory, 'incomplete_technical');
      assert.equal(capturedUpdate.editorialReview.adminMessage, 'Manque les repères au sol.');
      assert.equal(capturedUpdate.editorialReview.requiresAction, true);
    });

  });

  describe('rejectResource', () => {

    it('bascule le statut à rejected et isPublic=false', async () => {
      const currentDoc = {
        id: 'doc-rej',
        title: 'Document Refusé',
        publicationStatus: 'pending_review',
        isPublic: false
      };

      let capturedUpdate = null;
      const fakeGet = async () => currentDoc;
      const fakeUpdate = async (coll, id, update) => {
        capturedUpdate = update;
        return { ...currentDoc, ...update };
      };

      await rejectResource(
        'documents',
        'doc-rej',
        'Non conforme.',
        {
          _getResource: fakeGet,
          _updateResource: fakeUpdate
        }
      );

      assert.equal(capturedUpdate.publicationStatus, 'rejected');
      assert.equal(capturedUpdate.isPublic, false);
      assert.equal(capturedUpdate.editorialReview.reasonCategory, 'rejected');
      assert.equal(capturedUpdate.editorialReview.requiresAction, false);
    });

  });

  describe('resubmitResource', () => {

    it('bascule de needs_revision vers pending_review, maintient isPublic=false et renseigne l\'historique', async () => {
      const currentDoc = {
        id: 'doc-resubmit',
        title: 'Rythme Ancien',
        publicationStatus: 'needs_revision',
        isPublic: false,
        editorialReview: {
          reasonCategory: 'incomplete_technical',
          adminMessage: 'Veuillez ajouter la piste alfaia.',
          requiresAction: true
        }
      };

      let capturedUpdate = null;
      const fakeGet = async () => currentDoc;
      const fakeUpdate = async (coll, id, update) => {
        capturedUpdate = update;
        return { ...currentDoc, ...update };
      };

      const result = await resubmitResource(
        'rhythms',
        'doc-resubmit',
        {
          title: 'Rythme Corrigé avec Alfaia',
          description: 'Pistes complétées.'
        },
        {
          _getResource: fakeGet,
          _updateResource: fakeUpdate
        }
      );

      assert.equal(capturedUpdate.publicationStatus, 'pending_review');
      assert.equal(capturedUpdate.isPublic, false);
      assert.equal(capturedUpdate.title, 'Rythme Corrigé avec Alfaia');
      assert.equal(capturedUpdate.description, 'Pistes complétées.');
      assert.equal(capturedUpdate.editorialReview.requiresAction, false);
      assert.ok(capturedUpdate.editorialReview.resubmittedAt);
      assert.ok(capturedUpdate.history, 'Un historique doit être enregistré');
    });

    it('lève une erreur si la ressource est introuvable lors de la resoumission', async () => {
      const fakeGet = async () => null;

      await assert.rejects(
        async () => {
          await resubmitResource('rhythms', 'non-existant', {}, { _getResource: fakeGet });
        },
        /Ressource introuvable pour resoumission/
      );
    });

  });

});
