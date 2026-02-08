// /* eslint-disable react/prop-types */
// "use client";
// import { Navigate, Outlet } from "react-router-dom";
// import { Spin } from "antd";
// import { useAuth } from "../hooks/useAuth";

// /** Rôles supportés côté backend */
// export const ROLES = {
//   DEMANDEUR: "DEMANDEUR",
//   INSTITUT: "INSTITUT",
//   TRADUCTEUR: "TRADUCTEUR",
//   SUPERVISEUR: "SUPERVISEUR",
//   ADMIN: "ADMIN",
// } ;




// export const ProtectedRoute = ({
//   allowedRoles = [],
//   requiredPermissions = [],
//   requireAllPermissions = false,
//   children,
// }) => {
//   const { user, isAuthenticated, loading, logout } = useAuth();

//   // 1) Pendant le chargement
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   // 2) Non authentifié
//   if (!isAuthenticated || !user) {
//     return <Navigate to="/auth/login" replace />;
//   }

//   // 3) Compte désactivé (ton backend expose `enabled: boolean`)
//   if (user.enabled === false) {
//     // on coupe la session locale puis lock screen
//     logout();
//     return <Navigate to="/auth/lock-screen" replace />;
//   }

//   // 4) Raccourci: les ADMIN ont accès à tout
//   const isAdmin = user.role === ROLES.ADMIN;
//   if (isAdmin) return children ? <>{children}</> : <Outlet />;

//   // 5) Vérification du rôle
//   const hasAllowedRole =
//     allowedRoles.length === 0 || allowedRoles.includes(user.role);

//   // 6) Vérification des permissions (on utilise les KEYS; fallback sur names)
//   //    -> ton backend renvoie: permissions: [{id,key,name}]
//   const userPermissionKeys = Array.isArray(user.permissions)
//     ? user.permissions.map((p) =>
//         typeof p === "object" ? (p.key ?? p.name ?? "") : String(p)
//       )
//     : [];

//   const hasRequiredPermission =
//     requiredPermissions.length === 0
//       ? true
//       : requireAllPermissions
//       ? requiredPermissions.every((perm) => userPermissionKeys.includes(perm))
//       : requiredPermissions.some((perm) => userPermissionKeys.includes(perm));

//   if (!(hasAllowedRole && hasRequiredPermission)) {
//     console.warn("Accès refusé (rôle et/ou permission manquants)", {
//       userRole: user.role,
//       allowedRoles,
//       userPermissions: userPermissionKeys,
//       requiredPermissions,
//       requireAllPermissions,
//     });
//     return <Navigate to="/auth/not-access" replace />;
//   }

//   return children ? <>{children}</> : <Outlet />;
// };

/* eslint-disable react/prop-types */
"use client";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../hooks/useAuth";

export const ROLES = {
  DEMANDEUR: "DEMANDEUR",
  INSTITUT: "INSTITUT",
  TRADUCTEUR: "TRADUCTEUR",
  SUPERVISEUR: "SUPERVISEUR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

/** Tableau de bord par rôle : un utilisateur qui tente d'accéder à un autre espace est redirigé ici */
export const DASHBOARD_BY_ROLE = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.SUPER_ADMIN]: "/admin/dashboard",
  [ROLES.INSTITUT]: "/organisations/dashboard",
  [ROLES.SUPERVISEUR]: "/organisations/dashboard",
  [ROLES.TRADUCTEUR]: "/traducteur/dashboard",
  [ROLES.DEMANDEUR]: "/demandeur/dashboard",
};

export function getDashboardPathForRole(role) {
  return DASHBOARD_BY_ROLE[role] || "/auth/not-access";
}

export const ProtectedRoute = ({
  allowedRoles = [],                 // ex: ["DEMANDEUR"]
  requiredPermissions = [],          // ex: ["demandes.read"]
  requireAllPermissions = false,     // true = toutes; false = au moins une
  redirectTo = "/auth/not-access",   // destination si refus (ou "own-dashboard" pour rediriger vers le dashboard du rôle)
  children,
}) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  // 1) Pend. chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // 2) Non loggé : on redirige vers login en conservant l'URL demandée pour y revenir après connexion (sauf pages auth)
  if (!isAuthenticated || !user) {
    const from = location.pathname + location.search;
    const isAuthPage = from.startsWith("/auth");
    const loginUrl = from && !isAuthPage
      ? `/auth/login?redirect=${encodeURIComponent(from)}`
      : "/auth/login";
    return <Navigate to={loginUrl} replace state={{ from: location }} />;
  }

  // 3) Compte désactivé
  if (user.enabled === false) {
    logout();
    return <Navigate to="/auth/lock-screen" replace />;
  }

  const userRole = user?.role;
  const userRoles = Array.isArray(user?.roles) ? user.roles : userRole ? [userRole] : [];

  // 4) SUPER_ADMIN = accès total uniquement aux routes admin (vérifié via allowedRoles au niveau parent)
  // 5) ADMIN = idem, accès admin uniquement si la route le permet
  // On ne donne plus d'accès "automatique" à tout : chaque bloc de routes (Admin, Organisation, etc.)
  // doit déclarer explicitement allowedRoles. Si allowedRoles est vide, on considère que tout rôle authentifié est accepté (comportement legacy).

  // 6) Vérification du rôle pour cette route
  const hasAllowedRole =
    allowedRoles.length === 0 || allowedRoles.includes(userRole);

  // 7) Permissions (on préfère .key, fallback .name ou string)
  const userPermissionKeys = Array.isArray(user.permissions)
    ? user.permissions.map((p) =>
        typeof p === "object" ? (p.key ?? p.name ?? "") : String(p)
      )
    : [];

  const hasRequiredPermission =
    requiredPermissions.length === 0
      ? true
      : requireAllPermissions
      ? requiredPermissions.every((perm) => userPermissionKeys.includes(perm))
      : requiredPermissions.some((perm) => userPermissionKeys.includes(perm));

  if (!(hasAllowedRole && hasRequiredPermission)) {
    const targetRedirect =
      redirectTo === "own-dashboard"
        ? getDashboardPathForRole(userRole)
        : redirectTo;
    console.warn("Accès refusé (rôle/permission) – redirection vers tableau de bord du rôle", {
      userRole: userRole,
      allowedRoles,
      redirectTo: targetRedirect,
    });
    return <Navigate to={targetRedirect} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
