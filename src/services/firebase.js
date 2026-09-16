import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForDevOnly",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "o-girador.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "o-girador-dev",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "o-girador-dev.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
  appId: env.VITE_FIREBASE_APP_ID || "1:00000000000:web:mockid"
};

// Log un avertissement discret si les clés Firebase ne sont pas encore définies dans .env
if (!env.VITE_FIREBASE_API_KEY && typeof window !== 'undefined') {
  console.warn("⚠️ [O Girador Firebase] Aucune variable VITE_FIREBASE_API_KEY détectée. Définissez vos clés dans un fichier .env à la racine.");
}

// Initialisation unique de l'application Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Dynamic/safe initialization of Auth & Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Persistance de l'authentification dans le navigateur
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Firebase Auth - Erreur de persistance :", err);
  });
}
