import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a new subscription record in Firestore.
 * @param {Object} data - Subscription data (associationName, payerFirstName, payerLastName, billingEmail, plan, status)
 * @returns {Promise<string>} The document ID of the created subscription
 */
export const createSubscription = async (data) => {
  try {
    // Generate a secure random token for setup delegation
    const activationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const subscriptionData = {
      ...data,
      activationToken,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      delegatedTo: null,
      setupCompleted: false
    };

    const docRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);
    console.log(`[SubscriptionService] Subscription created with ID: ${docRef.id}`);
    
    return { id: docRef.id, token: activationToken };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Updates a subscription to delegate setup to another email.
 * @param {string} subscriptionId - The ID of the subscription
 * @param {string} mestreEmail - The email of the person to delegate to
 */
export const delegateConfiguration = async (subscriptionId, mestreEmail, token) => {
  try {
    const docRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(docRef, {
      delegatedTo: mestreEmail,
      updatedAt: serverTimestamp()
    });

    // Simulate sending email (would be replaced by Cloud Functions/Resend)
    const magicLink = `https://app.ogirador.fr/setup?token=${token}`;
    console.log(`[Email Simulation] Sending magic link to ${mestreEmail}...`);
    console.log(`[Email Content]: Vous avez été invité à configurer l'application Manager. Cliquez ici : ${magicLink}`);
    
    return true;
  } catch (error) {
    console.error('Error delegating configuration:', error);
    throw error;
  }
};
