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
    role = 'mestre',
    manualPassword,
    canWrite = true,
    isTrial = false,
    trialStartDate = null,
    trialEndDate = null
  } = data || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new HttpsError('invalid-argument', "L'adresse email est obligatoire.");
  }

  const requestedRole = (role || 'mestre').toLowerCase();
  const isMestre = requestedRole === 'mestre';
  const effectiveRole = isMestre ? 'mestre' : 'pro';

  const cleanEmail = email.trim().toLowerCase();
  const defaultGroupId = isMestre ? 'association' : 'guest-pro';
  const cleanGroupId = (groupId && typeof groupId === 'string' ? groupId : defaultGroupId).trim().toLowerCase();
  const defaultDisplayName = isMestre ? 'Mestre' : 'Invité Pro';
  const cleanDisplayName = (displayName && typeof displayName === 'string' ? displayName.trim() : '') || defaultDisplayName;

  // 🛡️ Garde-fou d'isolation absolue : Interdire d'assigner samambaia aux comptes d'essai ou invités
  if ((isTrial || !isMestre) && (cleanGroupId === 'samambaia' || cleanGroupId === 'samambaia-maracatu')) {
    throw new HttpsError('permission-denied', "Un compte invité ou à l'essai ne peut pas être assigné au groupe privé Samambaia.");
  }

  let trialEndDateMs = null;
  if (trialEndDate) {
    const parsed = new Date(trialEndDate).getTime();
    if (!isNaN(parsed)) trialEndDateMs = parsed;
  }

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

    // 6. Résolution du nom de l'association cible et vérification stricte des quotas
    const groupRef = db.collection('associations').doc(cleanGroupId);
    const groupDoc = await groupRef.get();
    let assocName = cleanGroupId;
    let assocData = null;

    if (groupDoc.exists) {
      assocData = groupDoc.data() || {};
      assocName = assocData.name || assocData.nom || cleanGroupId;
    } else {
      assocName = isMestre
        ? (cleanDisplayName && cleanDisplayName !== 'Mestre' ? `Bloco ${cleanDisplayName}` : cleanGroupId)
        : (cleanGroupId === 'pif' ? 'Laboratoire Pif' : 'Espace Invités & Professionnels');
      assocData = {
        groupId: cleanGroupId,
        name: assocName,
        quotas: { sequenciador: 20, dansador: isMestre ? 10 : 0, orchestrador: isMestre ? 10 : 0 },
        unlockedPacks: [],
        isGuestSpace: !isMestre,
        createdAt: FieldValue.serverTimestamp()
      };
      await groupRef.set(assocData);
    }

    // Vérification des quotas applicatifs Séquenceur
    const hasSequencer = isMestre
      ? (assocData?.appAccess?.sequenciador === true && (assocData?.mestreSequenciadorQuota > 0 || assocData?.mestreSequenciadorQuota === undefined))
      : Boolean(canWrite);

    // 7. Écriture directe du profil dans Firestore users/{uid}
    const userProfile = isMestre
      ? {
          uid: newUid,
          email: cleanEmail,
          displayName: cleanDisplayName,
          groupId: cleanGroupId,
          role: 'mestre',
          canWriteSequenciador: Boolean(hasSequencer),
          mestreId: newUid,
          isHidden: false,
          onboardingCompleted: true,
          tags: ['Mestre', 'Direction', 'Bureau', 'Vitrine', 'Logistique', 'Trésorerie'],
          createdAt: FieldValue.serverTimestamp(),
          createdVia: 'orquestrador_admin_mestre_provisioning'
        }
      : {
          uid: newUid,
          email: cleanEmail,
          displayName: cleanDisplayName,
          groupId: cleanGroupId,
          role: 'pro',
          canWriteSequenciador: Boolean(hasSequencer),
          mestreId: null,
          isHidden: true,
          onboardingCompleted: true,
          createdAt: FieldValue.serverTimestamp(),
          createdVia: 'orquestrador_admin_guest_provisioning'
        };

    if (isTrial || trialEndDate) {
      userProfile.isTrial = true;
      userProfile.trialStartDate = trialStartDate || new Date().toISOString();
      userProfile.trialEndDate = trialEndDate;
      userProfile.trialEndDateMs = trialEndDateMs;
      userProfile.trialGracePeriodDays = 60;
    }

    await db.collection('users').doc(newUid).set(userProfile);

    // 8. Génération du message d'invitation personnalisé
    const loginUrl = isMestre
      ? 'https://organizador.o-girador.com'
      : 'https://sequenciador.o-girador.com';

    const inviteMessage = isMestre
      ? `Bonjour ${cleanDisplayName} ! Ton espace ${assocName} est prêt sur O Girador. Connecte-toi sur ${loginUrl} avec l'email ${cleanEmail} et le mot de passe ${cleanPassword}.`
      : `Bonjour ${cleanDisplayName} ! Ton accès invité pro est activé sur O Girador. Connecte-toi sur ${loginUrl} avec l'email ${cleanEmail} et le mot de passe ${cleanPassword}.`;

    // 9. Retour des identifiants et métadonnées au client
    return {
      success: true,
      uid: newUid,
      email: cleanEmail,
      password: cleanPassword,
      groupId: cleanGroupId,
      displayName: cleanDisplayName,
      role: effectiveRole,
      assocName: assocName,
      inviteMessage: inviteMessage,
      loginUrl: loginUrl
    };
  } catch (error) {
    console.error('[adminCreateGuestUser] Erreur lors du provisioning :', error);
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'Cette adresse email possède déjà un compte.');
    }
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Erreur lors de la création du compte.');
  }
});

module.exports = { adminCreateGuestUser };
