import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Récupère les erreurs système (hub_system_errors) avec des filtres optionnels.
 * @param {Object} filters - Filtres { appId, groupId, status }
 * @returns {Promise<Array>} Liste des erreurs
 */
export const getSystemErrors = async (filters = {}) => {
  try {
    let q = collection(db, 'hub_system_errors');
    
    // On récupère tout et on trie localement pour éviter les problèmes d'index composite
    const snapshot = await getDocs(q);
    
    let results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        errorMessage: data.errorMessage || data.error || 'Erreur inconnue',
        stackTrace: data.stackTrace || data.stack || '',
        type: data.type || data.context || 'Système',
        status: data.status || (data.resolved ? 'resolved' : 'new')
      };
    });

    // Tri par date décroissante
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Application des filtres localement
    if (filters.appId) results = results.filter(r => r.appId === filters.appId);
    if (filters.groupId) results = results.filter(r => r.groupId === filters.groupId);
    if (filters.status) results = results.filter(r => r.status === filters.status);
    
    if (results.length === 0) {
      return [];
    }
    
    return results;
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
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const events = snapshot.docs
      .map(doc => doc.data())
      .filter(event => {
        const eventDate = event.timestamp?.toDate() || new Date();
        return eventDate >= startDate;
      });
      
    if (events.length === 0) {
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
    
    // Agrégation
    const activeAssociations = new Set();
    const featureUsage = {};
    const ageCounts = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0, 'unknown': 0 };
    const genderCounts = { 'Femme': 0, 'Homme': 0, 'Autre': 0, 'unknown': 0 };
    const countryCounts = {};
    
    let totalDuration = 0;
    let sessionsCount = 0;

    let eventsCount24h = 0;
    let connectionsCount = 0; // Number of session_start in last 24h

    const now = new Date();

    events.forEach(event => {
      const ts = event.timestamp?.toDate() || now;
      const isLast24h = (now - ts) < 24 * 60 * 60 * 1000;

      if (isLast24h) {
        eventsCount24h++;
      }

      if (event.groupId && event.groupId !== 'anonymous') {
        activeAssociations.add(event.groupId);
      }
      
      // Calculate top features (excluding technical ones)
      if (event.eventName !== 'session_start' && event.eventName !== 'session_end' && event.eventName !== 'page_view' && event.eventName !== 'visibility_hidden') {
        const featureKey = `${event.appId}:${event.eventName}`;
        featureUsage[featureKey] = (featureUsage[featureKey] || 0) + 1;
      }

      // Session Duration
      if (event.eventName === 'session_end' && event.duration) {
        totalDuration += event.duration;
        sessionsCount++;
      }

      // Connections & Demographics (count per session start)
      if (event.eventName === 'session_start') {
        if (isLast24h) connectionsCount++;

        const demo = event.demographics || {};
        
        // Age
        const age = demo.ageGroup || 'unknown';
        if (ageCounts[age] !== undefined) ageCounts[age]++;
        else ageCounts['unknown']++;

        // Gender
        const gender = demo.gender === 'female' ? 'Femme' : demo.gender === 'male' ? 'Homme' : demo.gender === 'other' ? 'Autre' : 'unknown';
        if (genderCounts[gender] !== undefined) genderCounts[gender]++;

        // Country
        const country = demo.country || 'unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    // Tri des fonctionnalités les plus utilisées (Top 10)
    const topFeatures = Object.entries(featureUsage)
      .map(([key, count]) => {
        const [appId, eventName] = key.split(':');
        return { appId, eventName, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Temps Moyen Passé
    let avgTimeSpent = "0m 00s";
    if (sessionsCount > 0) {
      const avgSeconds = Math.round(totalDuration / sessionsCount);
      const m = Math.floor(avgSeconds / 60);
      const s = String(avgSeconds % 60).padStart(2, '0');
      avgTimeSpent = `${m}m ${s}s`;
    }

    // Demographics Percentage Formatting Helper
    const calculatePercentages = (countsObj, totalCount) => {
      if (totalCount === 0) return [];
      return Object.entries(countsObj)
        .filter(([label, count]) => label !== 'unknown' && count > 0)
        .map(([label, count]) => ({
          label,
          percentage: Math.round((count / totalCount) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);
    };

    // Total demographics samples (excluding unknowns for exact percentages of known data, or just use all session starts)
    const totalAgeKnown = Object.entries(ageCounts).filter(([k]) => k !== 'unknown').reduce((acc, [, v]) => acc + v, 0);
    const totalGenderKnown = Object.entries(genderCounts).filter(([k]) => k !== 'unknown').reduce((acc, [, v]) => acc + v, 0);
    const totalCountryKnown = Object.entries(countryCounts).filter(([k]) => k !== 'unknown').reduce((acc, [, v]) => acc + v, 0);

    const demographics = {
      ageGroups: calculatePercentages(ageCounts, totalAgeKnown),
      gender: calculatePercentages(genderCounts, totalGenderKnown),
      countries: calculatePercentages(countryCounts, totalCountryKnown).slice(0, 3) // Top 3 countries
    };

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

import { awardAxePoints } from './gamificationService';

/**
 * Soumet un nouvel avis
 * @param {Object} reviewData - { rating, comment, userEmail, appSource }
 * @param {string} groupId - Optionnel, pour récompenser avec des points Axé
 */
export const submitReview = async (reviewData, groupId = null) => {
  try {
    await addDoc(collection(db, 'hub_reviews'), {
      ...reviewData,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    if (groupId) {
      await awardAxePoints(groupId, 'submit_review');
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la soumission de l'avis:", error);
    throw error;
  }
};

/**
 * Met à jour le statut d'un avis (modération)
 * @param {string} reviewId 
 * @param {string} status - 'pending', 'published', 'hidden'
 */
export const updateReviewStatus = async (reviewId, status) => {
  try {
    const reviewRef = doc(db, 'hub_reviews', reviewId);
    await updateDoc(reviewRef, { status });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avis:", error);
    throw error;
  }
};

/**
 * Récupère uniquement les avis publiés
 */
export const getPublishedReviews = async () => {
  try {
    // On utilise uniquement 'where' et on trie localement pour éviter le besoin d'un index composite
    const q = query(
      collection(db, 'hub_reviews'),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Tri local par date décroissante
    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Erreur lors de la récupération des avis publiés:", error);
    return [];
  }
};

/**
 * Récupère les inscrits à la newsletter (prospects)
 */
export const getProspects = async () => {
  try {
    const q = collection(db, 'prospects');
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Tri local par date d'inscription décroissante
    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Erreur lors de la récupération des prospects:", error);
    return [];
  }
};

