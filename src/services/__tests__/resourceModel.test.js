/**
 * Tests unitaires pour le modèle de ressource (resourceModel.js)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildResourceCreateData,
  buildResourceUpdateData,
  formatEditorialReview,
  PUBLICATION_STATUSES
} from '../resourceModel.js';

describe('Modèle de Données Standardisé (resourceModel)', () => {

  describe('buildResourceCreateData', () => {
    it('lève une erreur si authorGroupId est manquant ou vide', () => {
      assert.throws(() => {
        buildResourceCreateData({ title: 'Test' }, {});
      }, /Le champ 'authorGroupId' est obligatoire et immuable/);

      assert.throws(() => {
        buildResourceCreateData({ title: 'Test' }, { authorGroupId: '   ' });
      }, /Le champ 'authorGroupId' est obligatoire et immuable/);
    });

    it('initialise tous les champs standardisés avec les valeurs par défaut', () => {
      const result = buildResourceCreateData(
        { title: 'Mon Rythme' },
        { authorGroupId: 'assoc-1', authorName: 'Maracatu Sol' },
        { collectionName: 'rhythms' }
      );

      // Paternité
      assert.equal(result.authorGroupId, 'assoc-1');
      assert.equal(result.authorName, 'Maracatu Sol');
      assert.equal(result.originalSourceId, null);
      assert.equal(result.originalAuthorName, null);
      assert.equal(result.isRemix, false);

      // Axé & Métriques
      assert.equal(result.tier, 'sequence'); // inféré pour collection 'rhythms'
      assert.equal(result.axeValue, 20); // coût palier sequence = 20
      assert.equal(result.rewardClaimed, false);
      assert.equal(result.downloadsCount, 0);

      // Statut éditorial & Visibilité
      assert.equal(result.publicationStatus, 'draft');
      assert.equal(result.isPublic, false); // draft -> false
      assert.equal(result.editorialReview, null);
    });

    it('conserve originalSourceId et originalAuthorName en cas d\'import ou dérivation', () => {
      const result = buildResourceCreateData(
        { title: 'Dérivé' },
        { authorGroupId: 'assoc-2', authorName: 'Bateria Nova' },
        {
          collectionName: 'documents',
          originalSourceId: 'doc-source-123',
          originalAuthorName: 'Mestre Alfa',
          isRemix: true
        }
      );

      assert.equal(result.originalSourceId, 'doc-source-123');
      assert.equal(result.originalAuthorName, 'Mestre Alfa');
      assert.equal(result.isRemix, true);
    });

    it('respecte la règle stricte : isPublic est true UNIQUEMENT si publicationStatus === "published"', () => {
      // Cas 1 : Statuts non publiés -> isPublic doit être false
      for (const status of ['draft', 'pending_review', 'needs_revision', 'rejected']) {
        const doc = buildResourceCreateData(
          { title: 'Test' },
          { authorGroupId: 'assoc-1' },
          { publicationStatus: status }
        );
        assert.equal(doc.publicationStatus, status);
        assert.equal(doc.isPublic, false, `Pour le statut ${status}, isPublic doit être false`);
      }

      // Cas 2 : Statut 'published' -> isPublic doit être true
      const publishedDoc = buildResourceCreateData(
        { title: 'Test Public' },
        { authorGroupId: 'assoc-1' },
        { publicationStatus: 'published' }
      );
      assert.equal(publishedDoc.publicationStatus, 'published');
      assert.equal(publishedDoc.isPublic, true);
    });
  });

  describe('buildResourceUpdateData', () => {
    const baseDoc = {
      authorGroupId: 'assoc-1',
      authorName: 'Maracatu Sol',
      tier: 'sequence',
      axeValue: 20,
      publicationStatus: 'draft',
      isPublic: false
    };

    it('interdit la modification de authorGroupId si la valeur diffère', () => {
      assert.throws(() => {
        buildResourceUpdateData(baseDoc, { authorGroupId: 'assoc-usurpatrice' });
      }, /Violation d'intégrité : Le champ 'authorGroupId' est immuable/);
    });

    it('supprime silencieusement authorGroupId de la charge utile s\'il est identique', () => {
      const update = buildResourceUpdateData(baseDoc, {
        authorGroupId: 'assoc-1',
        title: 'Nouveau titre'
      });
      assert.equal('authorGroupId' in update, false);
      assert.equal(update.title, 'Nouveau titre');
    });

    it('recalcule axeValue si le tier est modifié', () => {
      const update = buildResourceUpdateData(baseDoc, { tier: 'bundle' });
      assert.equal(update.tier, 'bundle');
      assert.equal(update.axeValue, 50); // Coût du palier bundle
    });

    it('synchronise isPublic lorsque publicationStatus est mis à jour', () => {
      // Passage à published
      const updatePub = buildResourceUpdateData(baseDoc, { publicationStatus: 'published' });
      assert.equal(updatePub.publicationStatus, 'published');
      assert.equal(updatePub.isPublic, true);

      // Passage à needs_revision
      const updateRev = buildResourceUpdateData({ ...baseDoc, publicationStatus: 'published', isPublic: true }, {
        publicationStatus: 'needs_revision'
      });
      assert.equal(updateRev.publicationStatus, 'needs_revision');
      assert.equal(updateRev.isPublic, false);
    });

    it('met à jour publicationStatus si isPublic est modifié directement', () => {
      // isPublic forcé à true
      const updateTrue = buildResourceUpdateData(baseDoc, { isPublic: true });
      assert.equal(updateTrue.isPublic, true);
      assert.equal(updateTrue.publicationStatus, 'published');

      // isPublic forcé à false sur un doc déjà publié
      const updateFalse = buildResourceUpdateData(
        { ...baseDoc, publicationStatus: 'published', isPublic: true },
        { isPublic: false }
      );
      assert.equal(updateFalse.isPublic, false);
      assert.equal(updateFalse.publicationStatus, 'draft');
    });
  });

  describe('formatEditorialReview', () => {
    it('retourne null si aucune revue fournie', () => {
      assert.equal(formatEditorialReview(null), null);
      assert.equal(formatEditorialReview(undefined), null);
      assert.equal(formatEditorialReview('invalid'), null);
    });

    it('normalise la structure éditoriale complète', () => {
      const formatted = formatEditorialReview({
        reviewerRole: 'admin',
        reasonCategory: 'incomplete_audio',
        adminMessage: 'Veuillez ajouter une piste d\'alfaia.',
        suggestedTier: 'sequence',
        requiresAction: true
      });

      assert.equal(formatted.reviewerRole, 'admin');
      assert.equal(formatted.reasonCategory, 'incomplete_audio');
      assert.equal(formatted.adminMessage, 'Veuillez ajouter une piste d\'alfaia.');
      assert.equal(formatted.suggestedTier, 'sequence');
      assert.equal(formatted.requiresAction, true);
      assert.ok(formatted.reviewedAt);
    });
  });

});
