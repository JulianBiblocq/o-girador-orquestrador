import { useState, useEffect, useCallback } from 'react';
import { fetchAssociations, saveAssociation, deleteAssociation } from '../services/associationService';

/**
 * Hook personnalisé de gestion des abonnements et des structures d'associations (SOC)
 */
export function useSubscriptions() {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAssociations();
      setAssociations(list);
    } catch (err) {
      console.error("Erreur chargement abonnements :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addOrUpdateAssociation = async (formData) => {
    const newList = await saveAssociation(formData);
    setAssociations(newList);
    return newList;
  };

  const removeAssociation = async (id) => {
    const newList = await deleteAssociation(id);
    setAssociations(newList);
    return newList;
  };

  return {
    associations,
    loading,
    reload: loadData,
    addOrUpdateAssociation,
    removeAssociation
  };
}
