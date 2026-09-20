import assert from 'node:assert/strict';

// Test unitaire simulant le comportement de la Cloud Function getCrossAppAuthToken

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function createGetCrossAppAuthTokenHandler({ firestoreData = {}, createCustomTokenMock }) {
  return async function getCrossAppAuthToken(request) {
    const authData = request.auth || (request.context && request.context.auth);
    if (!authData || !authData.uid) {
      throw new MockHttpsError(
        "unauthenticated",
        "Vous devez être authentifié pour obtenir un jeton SSO."
      );
    }

    const uid = authData.uid;

    try {
      let role = 'membre';
      let groupId = '';
      let displayName = authData.token?.name || '';

      // 1. Récupération du profil Firestore de l'utilisateur
      try {
        if (firestoreData[uid]) {
          const userData = firestoreData[uid];
          role = userData.role || role;
          groupId = userData.groupId || '';
          displayName = userData.displayName || `${userData.prenom || ''} ${userData.nom || ''}`.trim() || displayName;
        }
      } catch (profileErr) {
        console.warn(`[SSO] Avertissement: Impossible d'accéder au profil Firestore pour ${uid} :`, profileErr);
      }

      // 2. Constitution des revendications personnalisées
      const customClaims = {
        role: role,
        groupId: typeof groupId === 'string' ? groupId.trim().toLowerCase() : (groupId || ''),
      };
      if (displayName) {
        customClaims.displayName = displayName;
      }

      // 3. Forge du jeton sécurisé via Firebase Admin SDK
      const customToken = await createCustomTokenMock(uid, customClaims);

      return {
        success: true,
        token: customToken,
        customToken: customToken
      };
    } catch (error) {
      if (error instanceof MockHttpsError) throw error;
      throw new MockHttpsError(
        "internal",
        `Impossible de forger le jeton d'authentification SSO : ${error.message || error}`
      );
    }
  };
}

console.log("===============================================================");
console.log("🧪 DÉBUT DES TESTS : Cloud Function getCrossAppAuthToken (SSO)");
console.log("===============================================================\n");

// Test 1 : Rejet des requêtes non authentifiées
console.log("▶️ Test 1 : Rejet immédiat si unauthenticated");
const handler = createGetCrossAppAuthTokenHandler({
  firestoreData: {},
  createCustomTokenMock: async () => "token_dummy"
});

await assert.rejects(
  async () => await handler({ auth: null }),
  (err) => err.code === 'unauthenticated',
  "La fonction doit rejeter avec 'unauthenticated' si l'utilisateur n'est pas connecté"
);
console.log("  ✅ [PASS] Rejet non authentifié validé");

// Test 2 : Forge de jeton avec injection role, groupId et displayName
console.log("\n▶️ Test 2 : Forge de jeton personnalisé avec claims utilisateur");
let capturedUid = null;
let capturedClaims = null;

const handlerWithUser = createGetCrossAppAuthTokenHandler({
  firestoreData: {
    'user_mestre_123': {
      role: 'mestre',
      groupId: 'Samambaia',
      prenom: 'Mestre',
      nom: 'Batista'
    }
  },
  createCustomTokenMock: async (uid, claims) => {
    capturedUid = uid;
    capturedClaims = claims;
    return `header.payload_signed_${uid}_${claims.role}_${claims.groupId}.sig`;
  }
});

const result = await handlerWithUser({
  auth: { uid: 'user_mestre_123', token: { name: 'Mestre Batista' } }
});

assert.strictEqual(result.success, true);
assert.ok(result.token.startsWith('header.payload_signed_user_mestre_123_mestre_samambaia'));
assert.strictEqual(result.token, result.customToken);
assert.strictEqual(capturedUid, 'user_mestre_123');
assert.strictEqual(capturedClaims.role, 'mestre');
assert.strictEqual(capturedClaims.groupId, 'samambaia');
assert.strictEqual(capturedClaims.displayName, 'Mestre Batista');
console.log("  ✅ [PASS] Jeton forgé avec succès et claims validés :", capturedClaims);

// Test 3 : Gestion gracieuse si profil Firestore absent
console.log("\n▶️ Test 3 : Repli gracieux si profil Firestore non trouvé");
const handlerFallback = createGetCrossAppAuthTokenHandler({
  firestoreData: {},
  createCustomTokenMock: async (uid, claims) => {
    return `token_fallback_${claims.role}`;
  }
});

const resFallback = await handlerFallback({
  auth: { uid: 'anonymous_or_new', token: {} }
});
assert.strictEqual(resFallback.success, true);
assert.strictEqual(resFallback.token, 'token_fallback_membre');
console.log("  ✅ [PASS] Repli par défaut (role: membre) validé");

console.log("\n===============================================================");
console.log("🏆 SUCCÈS TOTAL : TOUTES LES ASSERTIONS SSO SONT 100% VALIDÉES !");
console.log("===============================================================");
