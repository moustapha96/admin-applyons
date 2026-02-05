// routes/RoleBasedHomeRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // adapte le chemin à ton projet

const RoleBasedHomeRedirect = () => {
  const { user, loading } = useAuth?.() || { user: null, loading: false };

  // Pendant le chargement de l'état auth (optionnel)
  if (loading) {
    return null; // ou un loader plein écran
  }

  // Sécurité : si pas d'utilisateur, on renvoie vers le login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 🎯 Redirections selon le rôle
  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;

    case "DEMANDEUR":
      return <Navigate to="/demandeur/dashboard" replace />;

    case "TRADUCTEUR":
      return <Navigate to="/traducteur/dashboard" replace />;
    // Exemple pour un user d’organisation
    case "INSTITUT":
    case "SUPERVISEUR": 
      return <Navigate to="/organisations" replace />; // index = dashboard

    default:
      // Si tu veux, tu peux baser ça sur le fait qu'il ait une org
      if (user.organization) {
        return <Navigate to="/organisations" replace />;
      }
      // fallback : admin ou 404
      return <Navigate to="/admin/dashboard" replace />;
  }
};

export default RoleBasedHomeRedirect;
