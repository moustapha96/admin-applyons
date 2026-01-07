import { useContext } from "react";
import { PermissionsContext } from "../context/PermissionsContext";

/**
 * Valeurs par défaut pour éviter les erreurs si le contexte n'est pas encore disponible
 */
const defaultPermissionsContext = {
  permissions: [],
  permissionKeys: [],
  userPermissions: [],
  userPermissionKeys: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  getPermissionByKey: () => null,
  getPermissionLabel: (key) => key,
  getPermissionsByRole: () => [],
  refreshPermissions: async () => {},
  loading: false,
  error: null,
};

/**
 * Hook pour accéder au contexte des permissions
 * @returns {Object} Contexte des permissions avec toutes les fonctions et données
 * 
 * @example
 * const { hasPermission, userPermissionKeys, permissions } = usePermissions();
 * 
 * if (hasPermission('users.read')) {
 *   // Afficher le bouton
 * }
 */
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  // Si le contexte n'est pas disponible, retourner les valeurs par défaut
  // Cela évite les erreurs pendant l'initialisation
  if (context === undefined) {
    console.warn("usePermissions: PermissionsContext is undefined. Using default values. Make sure PermissionsProvider is mounted.");
    return defaultPermissionsContext;
  }
  return context;
};
