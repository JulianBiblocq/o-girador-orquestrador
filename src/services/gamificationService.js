import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

const SETTINGS_DOC_ID = 'gamification';

// Default rules if they don't exist in DB
export const DEFAULT_AXE_RULES = {
  account_creation: 50,
  submit_review: 10,
  create_sequence: 25,
  create_choreography: 25,
  complete_profile: 25,
  purchase_pack: 100,
  upgrade_plan: 200
};

/**
 * Récupère les règles d'attribution des points d'Axé
 */
export const getAxeRules = async () => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_AXE_RULES, ...docSnap.data() };
    }
    // Initialize if it doesn't exist
    await setDoc(docRef, DEFAULT_AXE_RULES);
    return DEFAULT_AXE_RULES;
  } catch (error) {
    console.error("Erreur lors de la récupération des règles d'Axé:", error);
    return DEFAULT_AXE_RULES;
  }
};

/**
 * Met à jour les règles d'attribution
 */
export const updateAxeRules = async (newRules) => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, newRules, { merge: true });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des règles d'Axé:", error);
    throw error;
  }
};

/**
 * Attribue dynamiquement des points d'Axé à une association en fonction de l'action
 * @param {string} groupId - L'ID de l'association
 * @param {string} actionKey - La clé de l'action (ex: 'submit_review')
 * @returns {Promise<number>} - Le nombre de points attribués
 */
export const awardAxePoints = async (groupId, actionKey) => {
  if (!groupId) return 0;

  try {
    const rules = await getAxeRules();
    const pointsToAward = rules[actionKey] || 0;

    if (pointsToAward > 0) {
      const groupRef = doc(db, 'associations', groupId);
      await updateDoc(groupRef, {
        contributionPoints: increment(pointsToAward)
      });
    }
    return pointsToAward;
  } catch (error) {
    console.error(`Erreur lors de l'attribution des points pour ${actionKey}:`, error);
    return 0;
  }
};
