/**
 * Helpers d'étanchéité SaaS Multi-Tenant pour la résolution des variantes de groupId.
 * Seul le groupe historique `samambaia` reçoit ses variantes de casse legacy.
 * Les groupes `samba` ou `sambareggae` ne doivent JAMAIS être confondus avec `samambaia`.
 */

export function isLegacySamambaiaGroup(groupId) {
  return String(groupId || '').trim().toLowerCase() === 'samambaia';
}

export function buildGroupQueryVariants(rawGroupId) {
  const trimmed = String(rawGroupId || '').trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();
  const variants = [trimmed, lower];
  if (isLegacySamambaiaGroup(lower)) {
    variants.push('Samambaia', 'samambaia', 'SAMAMBAIA');
  }
  return Array.from(new Set(variants)).filter(Boolean);
}
