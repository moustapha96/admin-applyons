# Documentation – Dashboard Applyons

Documentation technique du frontend **Applyons** (React + Vite).

## Sommaire

| Document | Description |
|----------|-------------|
| [01 - Introduction](01-INTRODUCTION.md) | Présentation du projet, stack technique, structure des dossiers |
| [02 - Authentification](02-AUTHENTICATION.md) | Connexion, redirection après login, « Se souvenir de moi », token et session |
| [03 - Routing et protection](03-ROUTING-ET-PROTECTION.md) | Routes, ProtectedRoute, rôles, paramètre `redirect` |
| [04 - Pages profil](04-PAGES-PROFIL.md) | Profils Demandeur, Traducteur, Institut (responsive, structure) |
| [05 - Développement](05-DEVELOPPEMENT.md) | Installation, scripts, variables d’environnement, conventions |

## Guides existants (racine du projet)

- **PERMISSIONS_ROLES_GUIDE.md** – Permissions et rôles (`allowedRoles`), utilisation frontend
- **PERMISSIONS_CONTEXT_README.md** – Contexte des permissions
- **MIGRATION_PERMISSIONS.md** – Migration des permissions

## Raccourcis

- **Authentification** : `src/context/AuthContext.jsx`, `src/pages/Authentication/auth-login.jsx`, `src/services/api.js`
- **Routes protégées** : `src/routes/ProtectedRoute.jsx`, `src/routes/AppRoutes.jsx`
- **Profils** : `src/pages/Demandeur/User-Profile/`, `src/pages/Traducteur/User-Profile/`, `src/pages/Institut/User-Profile/`
