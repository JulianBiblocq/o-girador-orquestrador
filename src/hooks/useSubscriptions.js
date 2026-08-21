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
      setAssociations(data);
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
