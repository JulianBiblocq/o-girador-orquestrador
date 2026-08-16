import { calculateSubscriptionStatus, getAccessRights } from './subscriptionRights';

/**
 * Helper centralisé de vérification des permissions et des droits Soft Lock
 */

export function checkUserPermissions(user, group) {
  const isAdmin = user && (user.role === 'admin' || user.isAdmin || true);
  const rights = getAccessRights(group);

  return {
    isAdmin,
    ...rights
  };
}

export { calculateSubscriptionStatus, getAccessRights };
