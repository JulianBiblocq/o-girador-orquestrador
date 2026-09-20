/**
 * Tests unitaires pour les paliers et métriques de stockage (storageTiers.js)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_TIERS,
  STARTER_STORAGE,
  STANDARD_STORAGE,
  PRO_STORAGE,
  UNLIMITED_STORAGE,
  formatStorageBytes,
  getStorageUsagePercent,
  inferQuotaFromPacks
} from '../storageTiers.js';

describe('Paliers de Stockage & Utilitaires (storageTiers)', () => {

  it('définit les paliers exacts en octets', () => {
    // STARTER : 100 Mo
    assert.equal(STORAGE_TIERS.STARTER, 100 * 1024 * 1024);
    assert.equal(STARTER_STORAGE, 104857600);

    // STANDARD : 1 Go
    assert.equal(STORAGE_TIERS.STANDARD, 1024 * 1024 * 1024);
    assert.equal(STANDARD_STORAGE, 1073741824);

    // PRO : 5 Go
    assert.equal(STORAGE_TIERS.PRO, 5 * 1024 * 1024 * 1024);
    assert.equal(PRO_STORAGE, 5368709120);

    // ILLIMITÉ : 25 Go
    assert.equal(STORAGE_TIERS.ILLIMITE, 25 * 1024 * 1024 * 1024);
    assert.equal(STORAGE_TIERS['ILLIMITÉ'], 25 * 1024 * 1024 * 1024);
    assert.equal(UNLIMITED_STORAGE, 26843545600);
  });

  it('l\'objet STORAGE_TIERS est immuable (Object.isFrozen)', () => {
    assert.equal(Object.isFrozen(STORAGE_TIERS), true);
  });

  it('formatStorageBytes formate convenablement les octets, Mo et Go', () => {
    assert.equal(formatStorageBytes(0), '0 Mo');
    assert.equal(formatStorageBytes(null), '0 Mo');
    assert.equal(formatStorageBytes(undefined), '0 Mo');
    assert.equal(formatStorageBytes(-100), '0 Mo');

    // 50 Mo
    assert.equal(formatStorageBytes(50 * 1024 * 1024), '50 Mo');

    // 5.5 Mo
    assert.equal(formatStorageBytes(5.5 * 1024 * 1024), '5.5 Mo');

    // 1 Go
    assert.equal(formatStorageBytes(1024 * 1024 * 1024), '1 Go');

    // 2.5 Go
    assert.equal(formatStorageBytes(2.5 * 1024 * 1024 * 1024), '2.5 Go');

    // 25 Go
    assert.equal(formatStorageBytes(25 * 1024 * 1024 * 1024), '25 Go');
  });

  it('getStorageUsagePercent calcule le pourcentage exact et borne à 100', () => {
    assert.equal(getStorageUsagePercent(0, 1000), 0);
    assert.equal(getStorageUsagePercent(500, 1000), 50);
    assert.equal(getStorageUsagePercent(850, 1000), 85);
    assert.equal(getStorageUsagePercent(950, 1000), 95);
    assert.equal(getStorageUsagePercent(1200, 1000), 100);
    assert.equal(getStorageUsagePercent(500, 0), 0);
  });

  it('inferQuotaFromPacks résout dynamiquement le quota selon unlockedPacks', () => {
    // Par défaut sans pack -> 1 Go
    assert.equal(inferQuotaFromPacks([]), STORAGE_TIERS.STANDARD);
    assert.equal(inferQuotaFromPacks(['decouverte']), STORAGE_TIERS.STANDARD);

    // Pack Gestion -> 5 Go
    assert.equal(inferQuotaFromPacks(['gestion-annual']), STORAGE_TIERS.PRO);
    assert.equal(inferQuotaFromPacks(['pack-gestion']), STORAGE_TIERS.PRO);

    // Pack Intégrale -> 25 Go
    assert.equal(inferQuotaFromPacks(['pack-integrale-annual']), STORAGE_TIERS.ILLIMITE);
    assert.equal(inferQuotaFromPacks(['gestion', 'integrale']), STORAGE_TIERS.ILLIMITE);
  });

});
