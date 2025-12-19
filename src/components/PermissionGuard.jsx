/* eslint-disable react/prop-types */
import { usePermissions } from "../hooks/usePermissions";

/**
 * Composant pour conditionner l'affichage selon les permissions
 * 
 * @example
 * <PermissionGuard permission="users.read">
 *   <Button>Voir les utilisateurs</Button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard any={["users.read", "users.manage"]}>
 *   <Button>Gérer les utilisateurs</Button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard all={["users.read", "users.manage"]}>
 *   <Button>Action nécessitant toutes les permissions</Button>
 * </PermissionGuard>
 */
export const PermissionGuard = ({ 
  children, 
  permission, 
  any = [], 
  all = [],
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Si une permission unique est spécifiée
  if (permission) {
    return hasPermission(permission) ? children : fallback;
  }

  // Si plusieurs permissions sont spécifiées (au moins une)
  if (any.length > 0) {
    return hasAnyPermission(any) ? children : fallback;
  }

  // Si toutes les permissions sont requises
  if (all.length > 0) {
    return hasAllPermissions(all) ? children : fallback;
  }

  // Par défaut, afficher si aucune condition n'est spécifiée
  return children;
};

export default PermissionGuard;
