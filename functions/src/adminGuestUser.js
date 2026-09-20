/**
 * Service Cloud Functions (v2) : Création rapide de comptes Pros & Invités
 * Permet au Super-Admin de provisionner un compte sans déconnecter sa session.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const crypto = require('crypto');

/**
 * Cloud Function HTTPS Callable : adminCreateGuestUser
 * Provisionne un utilisateur Firebase Auth + Firestore users/{uid} et initialise associations/{groupId}
 */
const adminCreateGuestUser = onCall({ cors: true }, async (request) => {
  // 1. Contrôle d'authentification compatible v1 et v2
  const authData = request.auth || (request.context && request.context.auth);
  if (!authData || !authData.uid) {
    throw new HttpsError('unauthenticated', 'Authentification requise pour cette action.');
  }

  const callerUid = authData.uid;
  const db = getFirestore();

  // 2. Contrôle de sécurité : Super-Admin ou Fondateur uniquement
  const callerDoc = await db.collection('users').doc(callerUid).get();
  const callerData = callerDoc.exists ? (callerDoc.data() || {}) : {};

  const isFounder = callerUid === 'iA0SweEHyOPzAPGIDVZdeKAV2mk1';
  const isSuperAdmin = (
    callerData.isSystemAdmin === true ||
    callerData.role === 'super-admin' ||
    callerData.role === 'admin' ||
    authData.token?.isSystemAdmin === true ||
    authData.token?.role === 'super-admin'
  );

  if (!isFounder && !isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Action réservée au Super-Admin.');
  }

  // 3. Extraction et normalisation des paramètres
  const data = request.data || request;
  const {
    email,
    displayName,
    groupId = 'guest-pro',
    manualPassword,
    canWrite = true
  } = data || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new HttpsError('invalid-argument', "L'adresse email est obligatoire.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanGroupId = (groupId && typeof groupId === 'string' ? groupId : 'guest-pro').trim().toLowerCase();
  const cleanDisplayName = (displayName && typeof displayName === 'string' ? displayName.trim() : '') || 'Invité Pro';

  // 4. Génération d'un mot de passe sécurisé ou conservation de la saisie manuelle
  const cleanPassword = (manualPassword && typeof manualPassword === 'string' && manualPassword.trim().length >= 6)
    ? manualPassword.trim()
    : `Girador-${crypto.randomBytes(3).toString('hex').toUpperCase()}!`;

  try {
    // 5. Création du compte dans Firebase Authentication via Firebase Admin SDK
    const userRecord = await getAuth().createUser({
      email: cleanEmail,
      password: cleanPassword,
      displayName: cleanDisplayName,
      emailVerified: true
    });
    const newUid = userRecord.uid;

    // 6. Écriture directe du profil dans Firestore users/{uid}
    await db.collection('users').doc(newUid).set({
      uid: newUid,
      email: cleanEmail,
      displayName: cleanDisplayName,
      groupId: cleanGroupId,
      role: 'pro',
      canWriteSequenciador: Boolean(canWrite),
      mestreId: null,
      isHidden: true, // Masqué des annuaires et trombinoscopes publics
      onboardingCompleted: true, // Accès direct au Séquenceur sans passer par l'onboarding
      createdAt: FieldValue.serverTimestamp(),
      createdVia: 'orquestrador_admin_guest_provisioning'
    });

    // 7. Provisioning automatique de l'espace dans associations/{groupId} si inexistant
    const groupRef = db.collection('associations').doc(cleanGroupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
      await groupRef.set({
        groupId: cleanGroupId,
        name: cleanGroupId === 'pif' ? 'Laboratoire Pif' : 'Espace Invités & Professionnels',
        quotas: { sequenciador: 20, dansador: 0, orchestrador: 0 },
        unlockedPacks: [],
        isGuestSpace: true,
        createdAt: FieldValue.serverTimestamp()
      });
    }

    // 8. Retour des identifiants générés au client
    return {
      success: true,
      uid: newUid,
      email: cleanEmail,
      password: cleanPassword,
      groupId: cleanGroupId,
      displayName: cleanDisplayName
    };
  } catch (error) {
    console.error('[adminCreateGuestUser] Erreur lors du provisioning :', error);
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'Cette adresse email possède déjà un compte.');
    }
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Erreur lors de la création du compte invité.');
  }
});

module.exports = { adminCreateGuestUser };
