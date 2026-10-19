// __tests__/security-rules.test.js
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'o-girador-7828c-test',
    firestore: {
      rules: fs.readFileSync(path.resolve(rootDir, 'firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080
    },
    storage: {
      rules: fs.readFileSync(path.resolve(rootDir, 'storage.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 9199
    }
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  }
});

describe('Sécurité Storage — Anti-Shadowing & Safe Delete', () => {
  it('Interdit la lecture publique des justificatifs de frais (expenses)', async () => {
    const unauthStorage = testEnv.unauthenticatedContext().storage();
    const expenseRef = unauthStorage.ref('associations/asso-123/expenses/facture.pdf');
    await assertFails(expenseRef.getDownloadURL());
  });

  it('Autorise la lecture publique des fichiers vitrine généraux', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const storage = context.storage();
      await storage.ref('associations/asso-123/logo.png').putString('image content');
    });
    const unauthStorage = testEnv.unauthenticatedContext().storage();
    const logoRef = unauthStorage.ref('associations/asso-123/logo.png');
    await assertSucceeds(logoRef.getDownloadURL());
  });

  it('Autorise la suppression (delete) sans blocage 403 lié à request.resource.size', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const storage = context.storage();
      await storage.ref('bounces/projet_audio.webm').putString('audio content');
    });
    const authStorage = testEnv.authenticatedContext('user_mestre', { role: 'mestre' }).storage();
    const bounceRef = authStorage.ref('bounces/projet_audio.webm');
    await assertSucceeds(bounceRef.delete());
  });
});

describe('Sécurité Firestore — Isolation Multi-Tenant & Événements', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.doc('users/user_alpha').set({ groupId: 'samambaia', role: 'membre' });
      await db.doc('users/user_beta').set({ groupId: 'cordao', role: 'membre' });
      await db.doc('events/event_1').set({ groupId: 'samambaia', title: 'Répétition' });
    });
  });

  it("Interdit la lecture des données d'une autre association", async () => {
    const userBetaDb = testEnv.authenticatedContext('user_beta').firestore();
    const docRef = userBetaDb.doc('events/event_1');
    await assertFails(docRef.get());
  });

  it('Autorise la consultation pour les membres du même groupe', async () => {
    const userAlphaDb = testEnv.authenticatedContext('user_alpha').firestore();
    const docRef = userAlphaDb.doc('events/event_1');
    await assertSucceeds(docRef.get());
  });

  it("Refuse à un membre de modifier des champs administratifs d'un événement", async () => {
    const userAlphaDb = testEnv.authenticatedContext('user_alpha').firestore();
    const docRef = userAlphaDb.doc('events/event_1');
    await assertFails(docRef.update({ budgetPrevisionnel: 5000 }));
  });

  it("Autorise un utilisateur à lire son propre profil sans restriction (règle d'or)", async () => {
    const userBetaDb = testEnv.authenticatedContext('user_beta').firestore();
    const selfDoc = userBetaDb.doc('users/user_beta');
    await assertSucceeds(selfDoc.get());
  });

  it("Interdit à un utilisateur de modifier son propre rôle", async () => {
    const userBetaDb = testEnv.authenticatedContext('user_beta').firestore();
    const selfDoc = userBetaDb.doc('users/user_beta');
    await assertFails(selfDoc.update({ role: 'admin' }));
  });

  it("Autorise la création de son profil avec paymentStatus 'unpaid' ou 'paid'", async () => {
    const userNew1Db = testEnv.authenticatedContext('user_new1', { email: 'new1@example.com' }).firestore();
    await assertSucceeds(userNew1Db.doc('users/user_new1').set({
      role: 'membre',
      paymentStatus: 'paid',
      statutActuel: 'active',
      tags: []
    }));

    const userNew2Db = testEnv.authenticatedContext('user_new2', { email: 'new2@example.com' }).firestore();
    await assertSucceeds(userNew2Db.doc('users/user_new2').set({
      role: 'membre',
      paymentStatus: 'unpaid',
      statutActuel: 'active',
      tags: []
    }));

    const userNew3Db = testEnv.authenticatedContext('user_new3', { email: 'new3@example.com' }).firestore();
    await assertFails(userNew3Db.doc('users/user_new3').set({
      role: 'membre',
      paymentStatus: 'exempted',
      statutActuel: 'active',
      tags: []
    }));
  });

  it("Interdit à un membre de modifier son propre paymentStatus sur update", async () => {
    const userBetaDb = testEnv.authenticatedContext('user_beta').firestore();
    const selfDoc = userBetaDb.doc('users/user_beta');
    await assertFails(selfDoc.update({ paymentStatus: 'paid' }));
  });

  it("Sas pending_payments : autorise le membre propriétaire de l'email à lire et purger son entrée", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.doc('pending_payments/adherent@example.com').set({
        amountEuros: 120,
        payerEmail: 'adherent@example.com'
      });
    });

    const userDb = testEnv.authenticatedContext('user_adherent', { email: 'adherent@example.com' }).firestore();
    const pendingRef = userDb.doc('pending_payments/adherent@example.com');
    await assertSucceeds(pendingRef.get());
    await assertSucceeds(pendingRef.delete());
  });

  it("Sas pending_payments : interdit à un membre de créer ou modifier dans le sas", async () => {
    const userDb = testEnv.authenticatedContext('user_adherent', { email: 'adherent@example.com' }).firestore();
    const pendingRef = userDb.doc('pending_payments/adherent@example.com');
    await assertFails(pendingRef.set({ amountEuros: 0 }));
  });

  it("Sas pending_payments : interdit à un tiers de lire ou supprimer l'entrée d'un autre membre", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.doc('pending_payments/target@example.com').set({ amountEuros: 50 });
    });

    const hackerDb = testEnv.authenticatedContext('user_hacker', { email: 'hacker@example.com' }).firestore();
    const pendingRef = hackerDb.doc('pending_payments/target@example.com');
    await assertFails(pendingRef.get());
    await assertFails(pendingRef.delete());
  });

  describe('Porte-Voix (Forum & Canaux) — Déblocage adhérents standards', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        // Membre sans badge ni tags (auteur du sujet)
        await db.doc('users/user_standard').set({
          groupId: 'samambaia',
          role: 'membre'
        });
        // Autre membre du même groupe (non-auteur)
        await db.doc('users/user_colleague').set({
          groupId: 'samambaia',
          role: 'membre'
        });
        // Membre d'une autre asso
        await db.doc('users/user_other_asso').set({
          groupId: 'autre_asso',
          role: 'membre'
        });
        // Canaux
        await db.doc('forum_channels/chan_public').set({
          groupId: 'samambaia',
          title: 'Général',
          readRoles: ['all']
        });
        await db.doc('forum_channels/chan_no_roles').set({
          groupId: 'samambaia',
          title: 'Discussion libre'
        });
        await db.doc('forum_channels/chan_restricted').set({
          groupId: 'samambaia',
          title: 'Bureau',
          readRoles: ['Bureau', 'Admin']
        });
        // Sujet existant
        await db.doc('forum/thread_1').set({
          groupId: 'samambaia',
          channelId: 'chan_public',
          authorId: 'user_standard',
          titre: 'Premier sujet',
          reponses: []
        });
      });
    });

    it('Autorise un adhérent sans tag à lire un canal avec readRoles [all]', async () => {
      const db = testEnv.authenticatedContext('user_standard').firestore();
      await assertSucceeds(db.doc('forum_channels/chan_public').get());
    });

    it('Autorise un adhérent sans tag à lire un canal sans propriété readRoles', async () => {
      const db = testEnv.authenticatedContext('user_standard').firestore();
      await assertSucceeds(db.doc('forum_channels/chan_no_roles').get());
    });

    it('Interdit la lecture d un canal restreint à un adhérent sans tag', async () => {
      const db = testEnv.authenticatedContext('user_standard').firestore();
      await assertFails(db.doc('forum_channels/chan_restricted').get());
    });

    it('Interdit la lecture d un canal à un utilisateur d un autre groupe', async () => {
      const db = testEnv.authenticatedContext('user_other_asso').firestore();
      await assertFails(db.doc('forum_channels/chan_public').get());
    });

    it('Autorise un membre à poster une réponse et mettre à jour les métadonnées de discussion', async () => {
      const db = testEnv.authenticatedContext('user_standard').firestore();
      await assertSucceeds(db.doc('forum/thread_1').update({
        reponses: [{ message: 'Super!', authorId: 'user_standard' }],
        derniereModification: '2026-10-03T10:00:00Z',
        dernierMessage: 'Super!',
        dernierAuteur: 'Standard User',
        dernierAuteurId: 'user_standard',
        nombreReponses: 1,
        reactions: { '👍': ['user_standard'] }
      }));
    });

    it('Interdit la mise à jour de champs administratifs non autorisés par un membre', async () => {
      const db = testEnv.authenticatedContext('user_colleague').firestore();
      await assertFails(db.doc('forum/thread_1').update({
        isPinned: true
      }));
    });

    it('Autorise la création de sujet par l auteur dans son groupe', async () => {
      const db = testEnv.authenticatedContext('user_standard').firestore();
      await assertSucceeds(db.doc('forum/thread_new').set({
        authorId: 'user_standard',
        groupId: 'samambaia',
        channelId: 'chan_public',
        titre: 'Nouveau sujet'
      }));
    });
  });

  describe('Paramètres Vitrine & Globaux (settings/{settingId})', () => {
    it('Autorise la lecture publique du document settings/hub_display pour les visiteurs', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('settings/hub_display').set({
          showPricing: false,
          showAddons: false,
          showTutorials: false
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(unauthDb.doc('settings/hub_display').get());
    });

    it('Interdit l\'écriture sur settings/hub_display à un utilisateur non authentifié', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthDb.doc('settings/hub_display').set({ showPricing: true }));
    });

    it('Interdit l\'écriture sur settings/hub_display à un membre standard sans rôle admin', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('users/simple_user').set({
          role: 'membre',
          groupId: 'samambaia'
        });
      });

      const userDb = testEnv.authenticatedContext('simple_user').firestore();
      await assertFails(userDb.doc('settings/hub_display').set({ showPricing: true }));
    });

    it('Autorise l\'administrateur système à écrire sur settings/hub_display', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('users/sys_admin').set({
          role: 'super-admin',
          isSystemAdmin: true,
          groupId: 'samambaia'
        });
      });

      const adminDb = testEnv.authenticatedContext('sys_admin', { isSystemAdmin: true }).firestore();
      await assertSucceeds(adminDb.doc('settings/hub_display').set({
        showPricing: true,
        showAddons: true,
        showTutorials: false
      }));
    });
  });

  describe('Cantador & Vocal Lab (toada_packs/{packId})', () => {
    it('Autorise la lecture publique des packs de toadas', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('toada_packs/pack_boi_bumba').set({
          title: 'Toadas Traditionnelles Boi Bumbá',
          visibility: 'public'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(unauthDb.doc('toada_packs/pack_boi_bumba').get());
    });

    it('Interdit la création de pack à un membre standard', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('users/standard_singer').set({
          role: 'membre',
          groupId: 'samambaia'
        });
      });

      const memberDb = testEnv.authenticatedContext('standard_singer').firestore();
      await assertFails(memberDb.doc('toada_packs/pack_new').set({
        title: 'Chant illégal'
      }));
    });

    it('Autorise la création et mise à jour de pack par un Mestre ou Admin', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('users/mestre_singer').set({
          role: 'mestre',
          groupId: 'samambaia'
        });
      });

      const mestreDb = testEnv.authenticatedContext('mestre_singer').firestore();
      await assertSucceeds(mestreDb.doc('toada_packs/pack_cordel').set({
        title: 'Packs Cantoria Cordel',
        groupId: 'samambaia'
      }));
    });
  });

  describe('Mestres à l\'essai & Période de grâce (Chantier 2)', () => {
    it('Autorise un mestre à l\'essai actif à créer un preset', async () => {
      const futureMs = Date.now() + 1000 * 60 * 60 * 24 * 14; // +14 jours
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('users/trial_active_mestre').set({
          role: 'mestre',
          groupId: 'demo_group',
          isTrial: true,
          trialEndDateMs: futureMs
        });
      });

      const mestreDb = testEnv.authenticatedContext('trial_active_mestre').firestore();
      await assertSucceeds(mestreDb.doc('presets/trial_preset_1').set({
        name: 'Baianá Démo',
        ownerId: 'trial_active_mestre',
        groupId: 'demo_group'
      }));
    });

    it('Interdit la création d\'un preset quand la période d\'essai est expirée', async () => {
      const pastMs = Date.now() - 1000 * 60 * 60 * 24; // -1 jour
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc('users/trial_expired_mestre').set({
          role: 'mestre',
          groupId: 'demo_group',
          isTrial: true,
          trialEndDateMs: pastMs
        });
      });

      const mestreDb = testEnv.authenticatedContext('trial_expired_mestre').firestore();
      await assertFails(mestreDb.doc('presets/trial_preset_expired').set({
        name: 'Preset Bloqué',
        ownerId: 'trial_expired_mestre',
        groupId: 'demo_group'
      }));
    });
  });
});

