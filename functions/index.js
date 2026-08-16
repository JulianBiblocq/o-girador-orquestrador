const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Clé statique d'authentification (doit correspondre au client VITE_OGIRADOR_HUB_API_KEY)
const API_KEY = process.env.VITE_OGIRADOR_HUB_API_KEY || "o-girador-telemetry-secret-key-2026";

// Middleware d'authentification par API Key
const apiKeyAuth = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }
  next();
};

app.post('/submit', apiKeyAuth, async (req, res) => {
  try {
    const payload = req.body;
    const { collectionType, data } = payload;
    
    if (!collectionType || !data) {
      return res.status(400).json({ error: 'Missing collectionType or data' });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

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
          occurrencesCount: admin.firestore.FieldValue.increment(1),
          lastSeenAt: timestamp,
          // Optionnel : on pourrait stocker les derniers `groupId` dans un tableau
        });
        return res.status(200).json({ success: true, message: 'Crash occurrence updated' });
      } else {
        // Nouveau crash
        await errorRef.add({
          ...data,
          occurrencesCount: 1,
          createdAt: timestamp,
          lastSeenAt: timestamp,
          status: 'new'
        });
        return res.status(201).json({ success: true, message: 'New crash registered' });
      }
    } 
    else if (collectionType === 'ticket') {
      await db.collection('hub_tickets').add({
        ...data,
        createdAt: timestamp,
        status: data.status || 'new'
      });
      return res.status(201).json({ success: true, message: 'Ticket created' });
    }
    else if (collectionType === 'review') {
      await db.collection('hub_reviews').add({
        ...data,
        createdAt: timestamp
      });
      return res.status(201).json({ success: true, message: 'Review created' });
    }
    else if (collectionType === 'telemetry') {
      await db.collection('hub_telemetry_daily').add({
        ...data,
        timestamp: timestamp
      });
      return res.status(201).json({ success: true, message: 'Telemetry logged' });
    }
    else {
      return res.status(400).json({ error: 'Invalid collectionType' });
    }

  } catch (error) {
    console.error("Erreur Ingestion Télémétrie:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Expose the API
exports.telemetry = functions.https.onRequest(app);
