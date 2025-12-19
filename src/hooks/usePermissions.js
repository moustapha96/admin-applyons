import { useContext } from "react";
import { PermissionsContext } from "../context/PermissionsContext";

/**
 * Hook pour accéder au contexte des permissions
 * @returns {Object} Contexte des permissions avec toutes les fonctions et données
 * @throws {Error} Si utilisé en dehors d'un PermissionsProvider
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
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
