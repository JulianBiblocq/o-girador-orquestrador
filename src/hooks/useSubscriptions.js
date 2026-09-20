import { useState, useEffect } from 'react';
import { saveAssociation, deleteAssociation, subscribeToAssociations } from '../services/associationService';

/**
 * Hook personnalisé de gestion des abonnements et des structures d'associations (SOC)
 */
export function useSubscriptions() {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAssociations((data) => {
      // Dédoublonnage robuste par clé insensible à la casse
      const deduplicatedMap = new Map();
      (data || []).forEach(assoc => {
        if (!assoc) return;
        const key = String(assoc.name || assoc.nom || assoc.id || '').trim().toLowerCase();
        if (!deduplicatedMap.has(key)) {
          deduplicatedMap.set(key, assoc);
        } else {
          const current = deduplicatedMap.get(key);
          if (assoc.id === 'Samambaia' || Object.keys(assoc).length > Object.keys(current).length) {
            deduplicatedMap.set(key, assoc);
          }
        }
      });
      setAssociations(Array.from(deduplicatedMap.values()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addOrUpdateAssociation = async (formData) => {
    return await saveAssociation(formData);
  };

  const removeAssociation = async (id) => {
    return await deleteAssociation(id);
  };

  return {
    associations,
    loading,
    reload: () => {}, // No longer needed
    addOrUpdateAssociation,
    removeAssociation
  };
}
