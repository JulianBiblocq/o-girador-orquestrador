/**
 * Utilitaires de calcul du statut d'essai et de période de grâce (Soft Lock Mestre à l'essai)
 */

export function calculateTrialStatus(userData) {
  if (!userData) return null;

  const endDateMs = userData.trialEndDateMs || 
    (userData.trialEndDate ? new Date(userData.trialEndDate).getTime() : null);

  if (!endDateMs || isNaN(endDateMs)) return null;

  const now = Date.now();
  const diffMs = endDateMs - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const gracePeriodDays = userData.trialGracePeriodDays || 60;

  if (diffDays >= 0) {
    return {
      isTrial: true,
      isTrialActive: true,
      isGracePeriod: false,
      isExpired: false,
      daysRemaining: diffDays,
      label: `Essai Mestre (J-${diffDays})`,
      badgeClass: 'bg-amber-600 text-white font-bold',
      canWrite: true,
      softLockBanner: diffDays <= 3 
        ? `⏳ Votre période d'essai Mestre expire dans ${diffDays} jour(s). Pensez à souscrire pour conserver vos droits d'écriture.`
        : null
    };
  }

  const graceDaysRemaining = gracePeriodDays + diffDays;
  if (graceDaysRemaining >= 0) {
    return {
      isTrial: true,
      isTrialActive: false,
      isGracePeriod: true,
      isExpired: true,
      daysRemaining: 0,
      graceDaysRemaining,
      label: `Grâce / Gel (J-${graceDaysRemaining})`,
      badgeClass: 'bg-red-800 text-red-100 font-bold',
      canWrite: false,
      softLockBanner: `⚠️ Votre période d'essai Mestre a expiré. Vos créations sont conservées sur le Cloud en lecture seule pendant encore ${graceDaysRemaining} jours. Activez votre abonnement pour débloquer l'écriture.`
    };
  }

  return {
    isTrial: true,
    isTrialActive: false,
    isGracePeriod: false,
    isExpired: true,
    isPurgePending: true,
    daysRemaining: 0,
    graceDaysRemaining: 0,
    label: 'Essai expiré',
    badgeClass: 'bg-stone-900 text-stone-400 font-bold',
    canWrite: false,
    softLockBanner: "🚨 Votre période d'essai et de grâce a expiré. Vos créations sont en attente d'archivage."
  };
}
