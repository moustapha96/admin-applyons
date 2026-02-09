# 03 – Routing et protection

## Vue d’ensemble

Les routes sont organisées par **rôle** (Admin, Organisation/Institut, Traducteur, Demandeur). L’accès aux routes protégées est géré par **ProtectedRoute**, qui vérifie l’authentification et le rôle (et éventuellement les permissions). En cas d’utilisateur non connecté, la redirection vers la page de login inclut l’URL demandée dans le paramètre **`redirect`** (sauf pour les pages d’auth).

## Fichiers principaux

- **`src/App.jsx`** – Arbre de routes (PublicRoutes, routes protégées par rôle)
- **`src/routes/AppRoutes.jsx`** – Agrégation des routes (admin, organisations, traducteur, demandeur, etc.)
- **`src/routes/ProtectedRoute.jsx`** – Composant de protection (auth + rôle + permissions)
- **`src/routes/PublicRoutes.jsx`** – Routes publiques (login, signup, forgot password, etc.)
- **`src/routes/OrganizationRoutes.jsx`** – Routes `/organisations/*` (Institut / Superviseur)
- **`src/routes/DemandeurRoutes.jsx`** – Routes `/demandeur/*`
- **`src/routes/TraducteurRoutes.jsx`** – Routes `/traducteur/*`
- **`src/routes/AdminRoutes.jsx`** – Routes `/admin/*`
- **`src/routes/ProfileRoutes.jsx`** – Redirection vers le profil selon le rôle
- **`src/routes/RoleBasedHomeRedirect.jsx`** – Redirection de la racine selon le rôle

## ProtectedRoute

- **Props** : `allowedRoles`, `requiredPermissions`, `requireAllPermissions`, `redirectTo`, `children` (ou utilisation en tant que layout avec `<Outlet />`).
- **Comportement** :
  1. Si `loading` (auth en cours) → affichage d’un spinner.
  2. Si non authentifié ou pas d’utilisateur → redirection vers `/auth/login` avec **`?redirect=<url actuelle>`** si l’URL actuelle n’est pas une page `/auth/*` (sinon redirection sans `redirect`).
  3. Si compte désactivé (`user.enabled === false`) → logout puis redirection vers `/auth/lock-screen`.
  4. Vérification du rôle (`allowedRoles`) et des permissions (`requiredPermissions`) ; en cas d’échec → redirection vers `redirectTo` ou vers le tableau de bord du rôle si `redirectTo === "own-dashboard"`.
- **Constantes exportées** : `ROLES`, `DASHBOARD_BY_ROLE`, `getDashboardPathForRole(role)`.

## Paramètre `redirect` (résumé)

- **Où il est ajouté** : dans `ProtectedRoute`, dans `RoleBasedHomeRedirect`, dans `ProfileRoutes`, et dans l’intercepteur de `api.js` (lors d’une 401 avec déconnexion). L’URL conservée est `location.pathname + location.search` (ou équivalent côté `window` dans api.js).
- **Contrainte** : on n’ajoute pas `redirect` si l’URL actuelle commence par `/auth` (pour éviter de rediriger après login vers une page de type login/register/forgot-password).
- **Utilisation** : sur la page de login, après un login réussi, `navigate(redirect || "/", { replace: true })` uniquement si `redirect` est « sûr » (commence par `/`, pas par `//` ni par `/auth`).

## Routes par rôle

- **Demandeur** : `DemandeurRoutes.jsx` – dashboard, demandes, profil, etc. ; `allowedRoles` inclut `DEMANDEUR`.
- **Organisation (Institut / Superviseur)** : `OrganizationRoutes.jsx` – dashboard, demandes d’authentification, utilisateurs, profil, etc. ; `allowedRoles` inclut `INSTITUT`, `SUPERVISEUR`.
- **Traducteur** : `TraducteurRoutes.jsx` – dashboard, dossiers à traiter, profil ; `allowedRoles` inclut `TRADUCTEUR`.
- **Admin** : `AdminRoutes.jsx` – dashboard, utilisateurs, organisations, paramètres, etc. ; `allowedRoles` inclut `ADMIN`, `SUPER_ADMIN`.

Les routes sont déclarées dans `App.jsx` / `AppRoutes.jsx` avec des layouts (sidebar, etc.) et des blocs `<Route element={<ProtectedRoute allowedRoles={[...]} />}>` contenant les sous-routes.

## Page de login (route publique)

- Chemin : `/auth/login`.
- Déclaration dans `PublicRoutes.jsx`. Aucune protection ; accessible sans être connecté.
