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
});
