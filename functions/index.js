const functions = require('firebase-functions');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const express = require('express');
const cors = require('cors');

// Initialisation modulaire de Firebase Admin SDK
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Clé statique d'authentification (doit correspondre au client VITE_OGIRADOR_HUB_API_KEY)
const API_KEY = process.env.VITE_OGIRADOR_HUB_API_KEY || "o-girador-telemetry-secret-key-2026";

// Middleware d'authentification par API Key
const apiKeyAuth = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (!key || key !== API_KEY) {
    console.warn("[Auth] Accès non autorisé sur l'API Hub:", {
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      hasApiKeyHeader: !!req.headers['x-api-key'],
      hasApiKeyQuery: !!req.query.apiKey
    });
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }
  next();
};

app.post('/submit', apiKeyAuth, async (req, res) => {
  try {
    const payload = req.body;
    const { collectionType, data } = payload;
    
    if (!collectionType || !data) {
      console.warn("[Validation] Payload incomplet reçu dans /submit:", { payload });
      return res.status(400).json({ error: 'Missing collectionType or data' });
    }

    const timestamp = FieldValue.serverTimestamp();

    if (collectionType === 'crash') {
      // Groupement des erreurs (Crash)
      const { errorMessage, appId } = data;
      const errorRef = db.collection('hub_system_errors');
      
      const snapshot = await errorRef
        .where('errorMessage', '==', errorMessage)
        .where('appId', '==', appId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        // Le crash existe déjà, on incrémente
        const docId = snapshot.docs[0].id;
        await errorRef.doc(docId).update({
          occurrencesCount: FieldValue.increment(1),
          lastSeenAt: timestamp,
        });
        console.log(`[Crash] Occurrence incrémentée pour doc ${docId} (app: ${appId})`);
        return res.status(200).json({ success: true, message: 'Crash occurrence updated' });
      } else {
        // Nouveau crash
        const newDoc = await errorRef.add({
          ...data,
          occurrencesCount: 1,
          createdAt: timestamp,
          lastSeenAt: timestamp,
          status: 'new'
        });
        console.log(`[Crash] Nouveau crash enregistré avec l'ID: ${newDoc.id} (app: ${appId})`);
        return res.status(201).json({ success: true, message: 'New crash registered', id: newDoc.id });
      }
    } 
    else if (collectionType === 'ticket') {
      const newDoc = await db.collection('hub_tickets').add({
        ...data,
        createdAt: timestamp,
        status: data.status || 'new'
      });
      console.log(`[Ticket] Nouveau ticket support créé: ${newDoc.id}`);
      return res.status(201).json({ success: true, message: 'Ticket created', id: newDoc.id });
    }
    else if (collectionType === 'review') {
      const newDoc = await db.collection('hub_reviews').add({
        ...data,
        createdAt: timestamp
      });
      console.log(`[Review] Nouvel avis créé: ${newDoc.id}`);
      return res.status(201).json({ success: true, message: 'Review created', id: newDoc.id });
    }
    else if (collectionType === 'telemetry') {
      const newDoc = await db.collection('hub_telemetry_daily').add({
        ...data,
        timestamp: timestamp
      });
      console.log(`[Telemetry] Métrique enregistrée: ${newDoc.id}`);
      return res.status(201).json({ success: true, message: 'Telemetry logged', id: newDoc.id });
    }
    else {
      console.warn(`[Validation] Type de collection non reconnu: ${collectionType}`);
      return res.status(400).json({ error: 'Invalid collectionType' });
    }

  } catch (error) {
    console.error("[Erreur Ingestion Télémétrie /submit]:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Route de diagnostic / santé (healthcheck)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'o-girador-hub-telemetry', nodeVersion: process.version });
});

// Expose the API via Firebase Functions
exports.telemetry = functions.https.onRequest(app);
