import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Récupère les erreurs système (hub_system_errors) avec des filtres optionnels.
 * @param {Object} filters - Filtres { appId, groupId, status }
 * @returns {Promise<Array>} Liste des erreurs
 */
export const getSystemErrors = async (filters = {}) => {
  try {
    let q = collection(db, 'hub_system_errors');
    
    // Construction de la requête avec filtres
    const constraints = [];
    if (filters.appId) constraints.push(where('appId', '==', filters.appId));
    if (filters.groupId) constraints.push(where('groupId', '==', filters.groupId));
    if (filters.status) constraints.push(where('status', '==', filters.status));
    
    // Tri par date décroissante
    constraints.push(orderBy('timestamp', 'desc'));

    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des bugs:", error);
    return [];
  }
};

/**
 * Met à jour le statut d'une erreur
 * @param {string} errorId - ID du document
 * @param {string} status - Nouveau statut ('new', 'investigating', 'resolved')
 */
export const updateErrorStatus = async (errorId, status) => {
  try {
    const errorRef = doc(db, 'hub_system_errors', errorId);
    await updateDoc(errorRef, { status });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
};

/**
 * Récupère les métriques d'utilisation depuis hub_telemetry_daily
 * @param {number} days - Nombre de jours d'historique (défaut 30)
 * @returns {Promise<Object>} Agrégats pour l'AnalyticsTab
 */
export const getTelemetryMetrics = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'hub_telemetry_daily'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => doc.data());
    
    // Agrégation
    const activeAssociations = new Set();
    const featureUsage = {};
    const eventsCount24h = events.filter(e => {
      const ts = e.timestamp?.toDate() || new Date();
      return (new Date() - ts) < 24 * 60 * 60 * 1000;
    }).length;

    events.forEach(event => {
      if (event.groupId && event.groupId !== 'anonymous') {
        activeAssociations.add(event.groupId);
      }
      
      const featureKey = `${event.appId}:${event.eventName}`;
      featureUsage[featureKey] = (featureUsage[featureKey] || 0) + 1;
    });

    // Tri des fonctionnalités les plus utilisées (Top 10)
    const topFeatures = Object.entries(featureUsage)
      .map(([key, count]) => {
        const [appId, eventName] = key.split(':');
        return { appId, eventName, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Mock demographics & time for the demo
    const demographics = {
      ageGroups: [
        { label: '18-24', percentage: 15 },
        { label: '25-34', percentage: 40 },
        { label: '35-44', percentage: 25 },
        { label: '45+', percentage: 20 },
      ],
      gender: [
        { label: 'Femme', percentage: 55 },
        { label: 'Homme', percentage: 42 },
        { label: 'Autre', percentage: 3 },
      ],
      countries: [
        { label: 'France', percentage: 85 },
        { label: 'Belgique', percentage: 10 },
        { label: 'Suisse', percentage: 5 },
      ]
    };
    const avgTimeSpent = "12m 45s";
    const connectionsCount = Math.floor(eventsCount24h * 1.5) || Math.floor(Math.random() * 50) + 100;

    return {
      activeAssociationsCount: activeAssociations.size,
      totalEvents: events.length,
      eventsCount24h,
      topFeatures,
      connectionsCount,
      avgTimeSpent,
      demographics
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques:", error);
    return {
      activeAssociationsCount: 0,
      totalEvents: 0,
      eventsCount24h: 0,
      topFeatures: [],
      connectionsCount: 0,
      avgTimeSpent: "0m 00s",
      demographics: { ageGroups: [], gender: [], countries: [] }
    };
  }
};

/**
 * Récupère les tickets du support (hub_tickets)
 * @param {Object} filters - Filtres optionnels { status, appSource }
 * @returns {Promise<Array>} Liste des tickets
 */
export const getTickets = async (filters = {}) => {
  try {
    let q = collection(db, 'hub_tickets');
    
    const constraints = [];
    if (filters.status) constraints.push(where('status', '==', filters.status));
    if (filters.appSource) constraints.push(where('appSource', '==', filters.appSource));
    
    constraints.push(orderBy('createdAt', 'desc'));
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error);
    return [];
  }
};

/**
 * Met à jour le statut d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} status - Nouveau statut
 */
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const ticketRef = doc(db, 'hub_tickets', ticketId);
    await updateDoc(ticketRef, { status });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du ticket:", error);
    throw error;
  }
};

/**
 * Récupère les avis (hub_reviews)
 * @returns {Promise<Array>} Liste des avis
 */
export const getReviews = async () => {
  try {
    const q = query(collection(db, 'hub_reviews'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error);
    return [];
  }
};
