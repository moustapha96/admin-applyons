# 04 – Pages profil

## Vue d’ensemble

Chaque espace (Demandeur, Traducteur, Institut) dispose d’une page **Profil** utilisateur, avec une structure commune : en-tête avec avatar et boutons, statistiques rapides, bloc « Informations personnelles » (édition + affichage en Descriptions), et selon le rôle : organisation (Traducteur, Institut) et permissions (Traducteur, Institut). Toutes ces pages sont **responsive** et utilisent **toute la largeur disponible**.

## Emplacements

- **Demandeur** : `src/pages/Demandeur/User-Profile/profile.jsx`
- **Traducteur** : `src/pages/Traducteur/User-Profile/profile.jsx`
- **Institut** : `src/pages/Institut/User-Profile/profile.jsx`

## Structure commune

1. **En-tête (carte dégradée)**  
   - Avatar (upload possible), nom / fallback, tags (rôle, statut actif/inactif), boutons (Modifier le profil, Mot de passe, Déconnexion pour Traducteur/Institut).
2. **Statistiques**  
   - Cartes (ex. dernière connexion, membre depuis, nombre de permissions pour Traducteur/Institut).
3. **Informations personnelles**  
   - Carte avec formulaire d’édition (Form Ant Design) ou affichage en **Descriptions** (libellé + valeur sur une même ligne).
4. **Organisation** (Traducteur, Institut uniquement)  
   - Carte avec formulaire d’édition ou Descriptions (nom, type, adresse, téléphone, pays, site, email).
5. **Permissions** (Traducteur, Institut)  
   - Carte avec rôle et liste de tags des permissions accordées.

## Responsive

- **Grid.useBreakpoint()** (Ant Design) est utilisé pour adapter tailles et espacements (`screens.sm`, `screens.md`, etc.).
- **Conteneur** : `w-full`, padding progressif (`px-3 sm:px-4 md:px-6`, `py-3 sm:py-4 md:py-6`), `overflow-x-hidden`, `max-w-full`.
- **En-tête** :
  - Avatar : taille 80px (mobile) → 96px (sm) → 120px (md+).
  - Ordre des blocs sur mobile : Avatar → Boutons → Nom/Tags (pour mettre les actions en avant).
  - Boutons : en colonne sur petit écran, `min-h-[44px]` pour le tactile, pleine largeur.
- **Statistiques** :
  - Colonnes : `xs={24} sm={12} md={8}` (1 → 2 → 3 colonnes pour les 3 cartes).
  - Padding des cartes et taille des valeurs selon breakpoint ; `wordBreak: "break-word"` pour les dates longues.
- **Informations personnelles / Organisation** :
  - Colonnes : `xs={24} md={12}` (pleine largeur sur mobile, deux colonnes côte à côte à partir de md).
  - Cartes : `w-full`, `min-w-0`, `!rounded-lg`, `bodyStyle` avec padding selon `screens.md`.
  - Formulaires : `size={screens.sm ? "middle" : "small"}`, classes pour `min-w-0`, labels en `text-xs` / `text-sm` selon breakpoint ; tous les champs (Input, Select, DatePicker) en `className="w-full"` pour éviter les débordements.
- **Descriptions** (affichage lecture seule) :
  - `layout="horizontal"`, `labelStyle` (nowrap, padding, verticalAlign top), `contentStyle` (wordBreak, verticalAlign top).
  - Classe pour largeur 100 % et alignement des libellés : `min-w-0` sur mobile, `min-w-[120px]` à partir de sm pour aligner les valeurs.
  - Bordures entre lignes et tailles de texte responsive.
- **Section Permissions** :
  - Titre et Divider en tailles responsive ; zone scrollable avec `max-h` responsive ; tags avec classes Tailwind (`!text-xs`, padding responsive).
- **Modal mot de passe** :
  - Largeur 100 % sur mobile, 480px à partir de sm ; `maxWidth: "calc(100vw - 24px)"`, `top: 24` ; formulaire en `size` responsive ; boutons en colonne sur mobile avec `min-h-[44px]`.

## Données et formulaires

- **Profil utilisateur** : chargement via `authService.getProfile()`, mise à jour via `authService.updateProfile()` (payload ou FormData si avatar).
- **Organisation** : lecture dans `userData.organization` ; édition via `organizationService.update()` (Traducteur) ou `orgService.update()` (Institut).
- **Permissions** : affichage en lecture seule à partir de `userData.permissions` ; pas d’édition depuis les pages profil (gérée côté admin / gestion des utilisateurs).

## Clés i18n

Les textes viennent de `profilePage.*` dans les fichiers de traduction (`src/i18n/locales/*.json`) : `profilePage.header.*`, `profilePage.fields.*`, `profilePage.buttons.*`, `profilePage.sections.*`, `profilePage.stats.*`, `profilePage.passwordModal.*`, `profilePage.orgEditor.*`, etc.
