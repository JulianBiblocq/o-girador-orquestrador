import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { slugifyAssociationId } from '../slugUtils.js';

describe('slugifyAssociationId', () => {
  it('transforme "Samb\'à Bulles" en "sambabulles"', () => {
    assert.strictEqual(slugifyAssociationId("Samb'à Bulles"), 'sambabulles');
  });

  it('gère les accents complexes et diacritiques', () => {
    assert.strictEqual(slugifyAssociationId('Étoile d\'Âme Française Çà-et-Là'), 'etoiledamefrancaisecaetla');
  });

  it('supprime les tirets, underscores et ponctuations pour former un slug compact', () => {
    assert.strictEqual(slugifyAssociationId('Bloco-Trovoada_2026 !'), 'blocotrovoada2026');
  });

  it('gère les valeurs nulles ou indéfinies sans planter', () => {
    assert.strictEqual(slugifyAssociationId(''), '');
    assert.strictEqual(slugifyAssociationId(null), '');
    assert.strictEqual(slugifyAssociationId(undefined), '');
  });
});
