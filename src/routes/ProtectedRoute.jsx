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
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../hooks/useAuth";

export const ROLES = {
  DEMANDEUR: "DEMANDEUR",
  INSTITUT: "INSTITUT",
  TRADUCTEUR: "TRADUCTEUR",
  SUPERVISEUR: "SUPERVISEUR",
  ADMIN: "ADMIN",
};

export const ProtectedRoute = ({
  allowedRoles = [],                 // ex: ["DEMANDEUR"]
  requiredPermissions = [],          // ex: ["demandes.read"]
  requireAllPermissions = false,     // true = toutes; false = au moins une
  redirectTo = "/auth/not-access",   // destination si refus
  children,
}) => {
  const { user, isAuthenticated, loading, logout } = useAuth();

  // 1) Pend. chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // 2) Non loggé
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3) Compte désactivé
  if (user.enabled === false) {
    logout();
    return <Navigate to="/auth/lock-screen" replace />;
  }

  // 4) Admin = accès total
  if (user.role === ROLES.ADMIN) {
    return children ? <>{children}</> : <Outlet />;
  }

  // 5) Rôles
  const hasAllowedRole =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  // 6) Permissions (on préfère .key, fallback .name ou string)
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
    console.warn("Accès refusé (rôle/permission)", {
      userRole: user.role,
      allowedRoles,
      userPermissions: userPermissionKeys,
      requiredPermissions,
      requireAllPermissions,
    });
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
