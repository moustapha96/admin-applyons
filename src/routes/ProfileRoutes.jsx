/* eslint-disable react/prop-types */
"use client";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Map rôle -> chemin profil du sous-espace
const profilePathForRole = (role) => {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/profile";            // on ajoute cette route côté Admin plus bas
    case "INSTITUT":
    case "SUPERVISEUR":
      return "/organisations/profile";    // déjà présent dans OrganizationRoutes
    case "TRADUCTEUR":
      return "/traducteur/profile";       // déjà présent dans TraducteurRoutes
    case "DEMANDEUR":
    default:
      return "/demandeur/profile";        // déjà présent dans DemandeurRoutes
  }
};

export default function ProfileRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;        // tu peux mettre un spinner si tu veux
  if (!isAuthenticated || !user) {
    const from = location.pathname + location.search;
    const loginTo = from && from !== "/auth/login"
      ? `/auth/login?redirect=${encodeURIComponent(from)}`
      : "/auth/login";
    return <Navigate to={loginTo} replace />;
  }

  const to = profilePathForRole(user.role);
  return <Navigate to={to} replace />;
}
