/**
 * Utilitaires de calcul des statuts d'abonnement et de la matrice de droits (Soft Lock)
 */

export function calculateSubscriptionStatus(endDateStr, planType) {
  if (planType === 'permanent' || planType === 'mestre') {
    return {
      status: 'active',
      label: 'Permanent / Illimité',
      badgeClass: 'bg-purple-800 text-purple-100',
      daysRemaining: Infinity,
      isWarning: false,
      isExpired: false
    };
  }

  if (!endDateStr) {
    return {
      status: 'expired',
      label: 'Inconnu / Expiré',
      badgeClass: 'bg-red-800 text-red-100',
      daysRemaining: 0,
      isWarning: true,
      isExpired: true
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDate = new Date(endDateStr);
  expirationDate.setHours(0, 0, 0, 0);

  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'Restreint / Expiré',
      badgeClass: 'bg-red-800 text-red-100',
      daysRemaining: diffDays,
      isWarning: true,
      isExpired: true
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'warning_7',
      label: `Relance (J-${diffDays})`,
      badgeClass: 'bg-orange-700 text-white font-bold animate-pulse',
      daysRemaining: diffDays,
      isWarning: true,
      isExpired: false
    };
  }

  if (diffDays <= 15) {
    return {
      status: 'warning_15',
      label: `Relance (J-${diffDays})`,
      badgeClass: 'bg-amber-700 text-white font-bold',
      daysRemaining: diffDays,
      isWarning: true,
      isExpired: false
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'warning_30',
      label: `Relance (J-${diffDays})`,
      badgeClass: 'bg-yellow-600 text-white font-semibold',
      daysRemaining: diffDays,
      isWarning: true,
      isExpired: false
    };
  }

  return {
    status: 'active',
    label: 'Actif',
    badgeClass: 'bg-emerald-700 text-white font-bold',
    daysRemaining: diffDays,
    isWarning: false,
    isExpired: false
  };
}

export function getAccessRights(group) {
  if (!group) {
    return {
      canCreateEvents: false,
      canEditTreasury: false,
      isProSequencer: false,
      isReadOnlyManager: true,
      hasSequenceurAccess: false,
      hasManagerAccess: false,
      hasVitrineAccess: false,
      softLockBanner: "Aucun groupe sélectionné.",
      statusInfo: calculateSubscriptionStatus(null, 'none')
    };
  }

  const statusInfo = calculateSubscriptionStatus(group.endDate, group.planType);
  const isExpired = statusInfo.isExpired;

  // Accès aux applications (Toggles administratifs)
  const hasSequenceurAccess = Boolean(group.appAccess?.sequenceur);
  const hasManagerAccess = Boolean(group.appAccess?.manager);
  const hasVitrineAccess = Boolean(group.appAccess?.vitrine);

  // Soft Lock : Si l'abonnement est expiré, le Manager passe en lecture seule et les créations sont bloquées
  const isReadOnlyManager = isExpired || !hasManagerAccess;
  const canCreateEvents = !isExpired && hasManagerAccess;
  const canEditTreasury = !isExpired && hasManagerAccess;
  const isProSequencer = !isExpired && hasSequenceurAccess;

  let softLockBanner = null;
  if (isExpired) {
    softLockBanner = "⚠️ Votre abonnement a expiré. Votre espace Manager est basculé en mode lecture seule. Les fonctionnalités d'écriture et de création sont désactivées jusqu'au renouvellement.";
  } else if (statusInfo.status === 'warning_7') {
    softLockBanner = `🚨 Urgence : Votre abonnement expire dans ${statusInfo.daysRemaining} jour(s). Pensez à renouveler pour conserver vos accès illimités.`;
  } else if (statusInfo.status === 'warning_15') {
    softLockBanner = `🔔 Rappel : Votre abonnement arrive à échéance dans ${statusInfo.daysRemaining} jours.`;
  } else if (statusInfo.status === 'warning_30') {
    softLockBanner = `ℹ️ Notification : Pensez au renouvellement annuel de votre Bloco d'ici ${statusInfo.daysRemaining} jours.`;
  }

  return {
    statusInfo,
    isExpired,
    isReadOnlyManager,
    canCreateEvents,
    canEditTreasury,
    isProSequencer,
    hasSequenceurAccess,
    hasManagerAccess,
    hasVitrineAccess,
    universeAccess: group.universeAccess || { maracatu: true, capoeira: false, samba: false },
    softLockBanner
  };
}
