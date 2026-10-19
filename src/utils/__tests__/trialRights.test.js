import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTrialStatus } from '../trialRights.js';

describe('calculateTrialStatus', () => {
  it('retourne null si aucune donnée ou pas de trialEndDate', () => {
    assert.equal(calculateTrialStatus(null), null);
    assert.equal(calculateTrialStatus({}), null);
    assert.equal(calculateTrialStatus({ role: 'mestre' }), null);
  });

  it('gère correctement un essai en cours (J+10)', () => {
    const futureMs = Date.now() + 10 * 24 * 60 * 60 * 1000;
    const status = calculateTrialStatus({
      trialEndDateMs: futureMs
    });

    assert.ok(status);
    assert.equal(status.isTrial, true);
    assert.equal(status.isTrialActive, true);
    assert.equal(status.isGracePeriod, false);
    assert.equal(status.isExpired, false);
    assert.equal(status.canWrite, true);
    assert.equal(status.daysRemaining, 10);
  });

  it('gère correctement la période de grâce de 60 jours après expiration', () => {
    // Expiré il y a 5 jours
    const pastMs = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const status = calculateTrialStatus({
      trialEndDateMs: pastMs
    });

    assert.ok(status);
    assert.equal(status.isTrial, true);
    assert.equal(status.isTrialActive, false);
    assert.equal(status.isGracePeriod, true);
    assert.equal(status.isExpired, true);
    assert.equal(status.canWrite, false);
    assert.equal(status.graceDaysRemaining, 55);
    assert.match(status.softLockBanner, /lecture seule/);
  });

  it('gère l expiration totale après les 60 jours de grâce', () => {
    // Expiré il y a 65 jours
    const longAgoMs = Date.now() - 65 * 24 * 60 * 60 * 1000;
    const status = calculateTrialStatus({
      trialEndDateMs: longAgoMs
    });

    assert.ok(status);
    assert.equal(status.isGracePeriod, false);
    assert.equal(status.isExpired, true);
    assert.equal(status.isPurgePending, true);
    assert.equal(status.canWrite, false);
  });
});
