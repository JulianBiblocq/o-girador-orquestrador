/**
 * Hook React facilitant la soumission et la publication d'une ressource au Terreiro.
 * Intègre la gestion des états de chargement, d'erreur et le dialogue de confirmation Remix.
 */

import { useState, useCallback } from 'react';
import { publishResource } from '../services/resourceService';

export function useResourcePublish() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsRemixConfirmation, setNeedsRemixConfirmation] = useState(false);
  const [pendingResource, setPendingResource] = useState(null);

  /**
   * Réinitialise les états du hook.
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setNeedsRemixConfirmation(false);
    setPendingResource(null);
  }, []);

  /**
   * Soumet une ressource au Terreiro.
   * En cas de détection d'une dérivation tierce sans flag remix, active `needsRemixConfirmation`.
   */
  const submit = useCallback(async ({
    collectionName,
    resourceId,
    currentGroupId,
    asRemix = false,
    targetTier = null,
    targetStatus = 'pending_review'
  }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await publishResource({
        collectionName,
        resourceId,
        currentGroupId,
        asRemix,
        targetTier,
        targetStatus
      });

      setLoading(false);
      setNeedsRemixConfirmation(false);
      setPendingResource(null);
      return { success: true, data: result };
    } catch (err) {
      setLoading(false);
      const message = err?.message || 'Erreur lors de la soumission de la ressource.';
      setError(message);

      // Si l'erreur provient du garde-fou anti-plagiat, on mémorise la ressource pour proposer le remix
      if (message.includes('Veuillez choisir l\'option "Remix"')) {
        setNeedsRemixConfirmation(true);
        setPendingResource({
          collectionName,
          resourceId,
          currentGroupId,
          targetTier,
          targetStatus
        });
      }

      return { success: false, error: message };
    }
  }, []);

  /**
   * Confirme la soumission en tant que Remix après le blocage anti-plagiat initial.
   */
  const confirmAsRemix = useCallback(async () => {
    if (!pendingResource) return { success: false, error: 'Aucune ressource en attente.' };
    return await submit({
      ...pendingResource,
      asRemix: true
    });
  }, [pendingResource, submit]);

  return {
    loading,
    error,
    needsRemixConfirmation,
    pendingResource,
    submit,
    confirmAsRemix,
    reset
  };
}
