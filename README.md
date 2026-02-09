# Dashboard Applyons

Interface web (frontend) de la plateforme **Applyons** : gestion des demandes, profils utilisateur, espaces Demandeur, Institut/Organisation, Traducteur et Administration.

## Stack

- **React 18** + **Vite 6**
- **React Router DOM 6**
- **Ant Design 5** + **Tailwind CSS 4**
- **Axios** (API + intercepteurs token/refresh)
- **i18next** (multilingue : fr, en, es, it, de, zh)

## Démarrage rapide

```bash
npm install
cp .env.example .env   # puis éditer .env (VITE_API_URL)
npm run dev
```

Ouvrir l’URL affichée (souvent `http://localhost:5173`). Le backend doit être configuré et accessible (voir projet `server-applyons-nodejs`).

## Scripts

| Commande        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Serveur de développement |
| `npm run build`| Build de production      |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | ESLint                   |

## Documentation

La documentation technique est dans le dossier **`docs/`** :

- **[docs/README.md](docs/README.md)** – Sommaire de la documentation
- **[01 - Introduction](docs/01-INTRODUCTION.md)** – Présentation, stack, structure du projet
- **[02 - Authentification](docs/02-AUTHENTICATION.md)** – Connexion, redirect après login, « Se souvenir de moi », token/session
- **[03 - Routing et protection](docs/03-ROUTING-ET-PROTECTION.md)** – Routes, ProtectedRoute, rôles, paramètre `redirect`
- **[04 - Pages profil](docs/04-PAGES-PROFIL.md)** – Profils Demandeur, Traducteur, Institut (responsive)
- **[05 - Développement](docs/05-DEVELOPPEMENT.md)** – Installation, variables d’environnement, conventions

Guides à la racine :

- **PERMISSIONS_ROLES_GUIDE.md** – Permissions et rôles (`allowedRoles`)
- **PERMISSIONS_CONTEXT_README.md** – Contexte des permissions
- **MIGRATION_PERMISSIONS.md** – Migration des permissions

## Rôles

| Rôle           | Espace principal   |
|----------------|--------------------|
| DEMANDEUR      | `/demandeur/*`     |
| INSTITUT / SUPERVISEUR | `/organisations/*` |
| TRADUCTEUR     | `/traducteur/*`    |
| ADMIN / SUPER_ADMIN | `/admin/*`   |

## Licence

Projet privé Applyons.
