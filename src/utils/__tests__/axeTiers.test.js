/**
 * Tests unitaires pour la matrice des Paliers d'Axé (axeTiers.js)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AXE_TIERS,
  VALID_TIER_KEYS,
  isValidTier,
  getTierConfig,
  calculateReward,
  calculateImportCost,
  calculateDividend,
  inferDefaultTier
} from '../axeTiers.js';

describe('Matrice des Paliers d\'Axé (axeTiers)', () => {

  it('définit les 5 paliers avec les valeurs exactes spécifiées', () => {
    assert.deepEqual(VALID_TIER_KEYS, ['varal', 'lutherie', 'sequence', 'combo', 'bundle']);

    // 'varal' : cost = 5, initialReward = 10, dividend = 2
    assert.equal(AXE_TIERS.varal.cost, 5);
    assert.equal(AXE_TIERS.varal.initialReward, 10);
    assert.equal(AXE_TIERS.varal.dividend, 2);

    // 'lutherie' : cost = 15, initialReward = 20, dividend = 5
    assert.equal(AXE_TIERS.lutherie.cost, 15);
    assert.equal(AXE_TIERS.lutherie.initialReward, 20);
    assert.equal(AXE_TIERS.lutherie.dividend, 5);

    // 'sequence' : cost = 20, initialReward = 25, dividend = 5
    assert.equal(AXE_TIERS.sequence.cost, 20);
    assert.equal(AXE_TIERS.sequence.initialReward, 25);
    assert.equal(AXE_TIERS.sequence.dividend, 5);

    // 'combo' : cost = 35, initialReward = 40, dividend = 10
    assert.equal(AXE_TIERS.combo.cost, 35);
    assert.equal(AXE_TIERS.combo.initialReward, 40);
    assert.equal(AXE_TIERS.combo.dividend, 10);

    // 'bundle' : cost = 50, initialReward = 60, dividend = 15
    assert.equal(AXE_TIERS.bundle.cost, 50);
    assert.equal(AXE_TIERS.bundle.initialReward, 60);
    assert.equal(AXE_TIERS.bundle.dividend, 15);
  });

  it('l\'objet AXE_TIERS est immuable (Object.isFrozen)', () => {
    assert.equal(Object.isFrozen(AXE_TIERS), true);
    assert.equal(Object.isFrozen(AXE_TIERS.varal), true);
  });

  it('isValidTier valide uniquement les paliers connus', () => {
    assert.equal(isValidTier('varal'), true);
    assert.equal(isValidTier('lutherie'), true);
    assert.equal(isValidTier('sequence'), true);
    assert.equal(isValidTier('combo'), true);
    assert.equal(isValidTier('bundle'), true);
    assert.equal(isValidTier('premium'), false);
    assert.equal(isValidTier(''), false);
    assert.equal(isValidTier(null), false);
  });

  it('getTierConfig retourne la configuration ou lève une exception', () => {
    const config = getTierConfig('sequence');
    assert.equal(config.cost, 20);
    assert.equal(config.initialReward, 25);

    assert.throws(() => {
      getTierConfig('inconnu');
    }, /Palier d'Axé inconnu/);
  });

  it('calculateReward retourne la récompense initiale exacte', () => {
    assert.equal(calculateReward('varal'), 10);
    assert.equal(calculateReward('lutherie'), 20);
    assert.equal(calculateReward('sequence'), 25);
    assert.equal(calculateReward('combo'), 40);
    assert.equal(calculateReward('bundle'), 60);
  });

  it('calculateImportCost retourne le coût d\'importation (axeValue) exact', () => {
    assert.equal(calculateImportCost('varal'), 5);
    assert.equal(calculateImportCost('lutherie'), 15);
    assert.equal(calculateImportCost('sequence'), 20);
    assert.equal(calculateImportCost('combo'), 35);
    assert.equal(calculateImportCost('bundle'), 50);
  });

  it('calculateDividend retourne le dividende reversé exact', () => {
    assert.equal(calculateDividend('varal'), 2);
    assert.equal(calculateDividend('lutherie'), 5);
    assert.equal(calculateDividend('sequence'), 5);
    assert.equal(calculateDividend('combo'), 10);
    assert.equal(calculateDividend('bundle'), 15);
  });

  it('inferDefaultTier infère le palier selon la collection et le type', () => {
    assert.equal(inferDefaultTier('documents', 'culture_fiche'), 'varal');
    assert.equal(inferDefaultTier('documents', 'fabrication'), 'lutherie');
    assert.equal(inferDefaultTier('instrument_models'), 'lutherie');
    assert.equal(inferDefaultTier('rhythms'), 'sequence');
    assert.equal(inferDefaultTier('choreographies'), 'sequence');
    assert.equal(inferDefaultTier('rhythms', 'combo_pack'), 'combo');
    assert.equal(inferDefaultTier('choreographies', 'bundle_danse'), 'bundle');
  });

});
