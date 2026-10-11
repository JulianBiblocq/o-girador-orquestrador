import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  DEFAULT_HUB_DISPLAY_SETTINGS, 
  HUB_DISPLAY_DOC_ID 
} from '../hubSettingsService.js';

describe('Service de Configuration Vitrine (hubSettingsService)', () => {
  it('définit l\'identifiant de document settings/hub_display', () => {
    assert.strictEqual(HUB_DISPLAY_DOC_ID, 'hub_display');
  });

  it('définit les champs par défaut désactivés pour le premier déploiement', () => {
    assert.deepStrictEqual(DEFAULT_HUB_DISPLAY_SETTINGS, {
      showPricing: false,
      showAddons: false,
      showTutorials: false
    });
    // Vérification de non-mutation accidentelle
    assert.strictEqual(DEFAULT_HUB_DISPLAY_SETTINGS.showPricing, false);
    assert.strictEqual(DEFAULT_HUB_DISPLAY_SETTINGS.showAddons, false);
    assert.strictEqual(DEFAULT_HUB_DISPLAY_SETTINGS.showTutorials, false);
  });
});
