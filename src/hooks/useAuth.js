import { useAuth as useAuthFromContext } from '../context/AuthContext';

/**
 * Hook personnalisé d'accès à la session d'authentification et au rôle administrateur
 */
export function useAuth() {
  return useAuthFromContext();
}
