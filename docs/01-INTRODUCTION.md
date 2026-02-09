# 01 – Introduction

## Présentation

**Dashboard Applyons** est l’interface d’administration et d’usage de la plateforme Applyons. Elle permet aux différents types d’utilisateurs (demandeurs, instituts/organisations, traducteurs, administrateurs) de gérer leurs demandes, documents, profils et paramètres.

## Stack technique

- **React 18** – Interface utilisateur
- **Vite 6** – Build et dev server
- **React Router DOM 6** – Routage
- **Ant Design 5** – Composants UI (Card, Form, Table, Modal, etc.)
- **Tailwind CSS 4** – Utilitaires CSS et responsive
- **Axios** – Requêtes HTTP (avec intercepteurs pour le token)
- **i18next** – Internationalisation (fr, en, es, it, de, zh)
- **dayjs** – Dates
- **js-cookie** – Cookies (optionnel, pour « Se souvenir de moi »)
- **Sonner** – Toasts / notifications

## Structure des dossiers (principale)

```
dashboard-applyons/
├── public/                 # Assets statiques, favicons, PWA
├── src/
│   ├── App.jsx             # Point d’entrée de l’app, providers
│   ├── main.jsx
│   ├── auth/               # Permissions, authz
│   ├── components/         # Composants réutilisables (sidebar, topnav, etc.)
│   ├── context/            # AuthContext, Permissions, i18n
│   ├── hooks/              # useAuth, usePermissions, useOrgScope
│   ├── i18n/               # Configuration et locales (fr, en, …)
│   ├── pages/              # Pages par espace
│   │   ├── Admin/          # Back-office admin
│   │   ├── Authentication/ # Login, signup, forgot password, etc.
│   │   ├── Demandeur/      # Espace demandeur (demandes, profil)
│   │   ├── Institut/       # Espace organisation / institut
│   │   ├── Traducteur/     # Espace traducteur
│   │   └── ...
│   ├── routes/             # Définition des routes et protection
│   ├── services/           # API (authService, api.js, …)
│   └── utils/              # Helpers (dateFormat, imageUtils, …)
├── docs/                   # Documentation (ce dossier)
├── .env                    # Variables d’environnement (VITE_*)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Rôles utilisateur

| Rôle | Espace principal | Description |
|------|------------------|-------------|
| **DEMANDEUR** | `/demandeur/*` | Création et suivi de demandes |
| **INSTITUT** / **SUPERVISEUR** | `/organisations/*` | Gestion organisation, demandes d’authentification |
| **TRADUCTEUR** | `/traducteur/*` | Traductions, dossiers à traiter |
| **ADMIN** / **SUPER_ADMIN** | `/admin/*` | Administration globale |

Les routes et les menus sont filtrés selon le rôle ; la protection est gérée par `ProtectedRoute` et les fichiers de routes par rôle (voir [03 - Routing et protection](03-ROUTING-ET-PROTECTION.md)).

## Variables d’environnement

- **VITE_API_URL** – URL de base de l’API backend (ex. `http://localhost:3000/api` ou l’URL de production).

D’autres variables `VITE_*` peuvent exister pour des services tiers (paiement, etc.). Voir [05 - Développement](05-DEVELOPPEMENT.md).
