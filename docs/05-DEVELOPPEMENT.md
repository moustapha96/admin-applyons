# 05 – Développement

## Prérequis

- **Node.js** 18+ (recommandé LTS)
- **npm** ou **yarn**

## Installation

```bash
cd dashboard-applyons
npm install
```

## Variables d’environnement

Créer un fichier **`.env`** à la racine du projet (voir `.env.example` s’il existe). Variables courantes :

- **VITE_API_URL** – URL de base de l’API (ex. `http://localhost:3000/api` en dev, ou l’URL de l’API en production).

Toute variable utilisée côté frontend doit être préfixée par **`VITE_`** pour être exposée dans le build Vite.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (Vite) avec HMR |
| `npm run build` | Build de production (sortie dans `dist/`) |
| `npm run preview` | Prévisualisation du build de production |
| `npm run lint` | Exécution d’ESLint |

## Lancer l’application en local

1. Configurer `.env` (au minimum `VITE_API_URL` pointant vers le backend).
2. Démarrer le backend (voir la doc du projet `server-applyons-nodejs` si applicable).
3. Exécuter `npm run dev` et ouvrir l’URL indiquée (souvent `http://localhost:5173`).

## Conventions de code

- **Composants** : fichiers `.jsx` (ou `.tsx` si TypeScript) ; noms en PascalCase.
- **Hooks** : préfixe `use` (ex. `useAuth`, `usePermissions`).
- **Services** : dans `src/services/`, un fichier par domaine (authService, api, etc.).
- **Routes** : définitions dans `src/routes/` ; protection via `ProtectedRoute` et `allowedRoles`.
- **Traductions** : clés dans les JSON sous `src/i18n/locales/` ; utilisation via `useTranslation()` et `t('namespace.key')`.
- **Styles** : Tailwind en priorité ; Ant Design pour les composants (Card, Form, Table, etc.) ; éviter les styles inline sauf pour des cas précis (ex. dégradé de la carte profil).

## Structure des routes (rappel)

- **Publiques** : `/auth/login`, `/auth/signup`, `/auth/re-password`, etc.
- **Protégées par rôle** : `/demandeur/*`, `/organisations/*`, `/traducteur/*`, `/admin/*`.
- **Profil** : `/demandeur/profile`, `/organisations/profile`, `/traducteur/profile` (ou redirection via ProfileRoutes selon le rôle).

## API (service api.js)

- Une **instance Axios** unique avec `baseURL` = `VITE_API_URL`.
- **Intercepteur requête** : ajout de `Authorization: Bearer <token>` pour les routes non publiques ; le token est lu dans `localStorage` ou `sessionStorage`.
- **Intercepteur réponse** : en cas de 401 sur une route protégée, tentative de refresh ; en cas d’échec, purge du token et redirection vers `/auth/login?redirect=...` (sauf si l’URL actuelle est une page auth).

## Documentation associée

- [01 - Introduction](01-INTRODUCTION.md)
- [02 - Authentification](02-AUTHENTICATION.md)
- [03 - Routing et protection](03-ROUTING-ET-PROTECTION.md)
- [04 - Pages profil](04-PAGES-PROFIL.md)
- À la racine : **PERMISSIONS_ROLES_GUIDE.md**, **PERMISSIONS_CONTEXT_README.md**, **MIGRATION_PERMISSIONS.md**
