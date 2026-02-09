# 02 – Authentification

## Vue d’ensemble

L’authentification repose sur un **token JWT** stocké soit en **localStorage** (session persistante), soit en **sessionStorage** (session à la fermeture de l’onglet), selon l’option « Se souvenir de moi ». Le contexte React `AuthContext` et le service `api.js` gèrent le token et la déconnexion (401).

## Fichiers principaux

- **`src/context/AuthContext.jsx`** – État global (user, token), login, logout, refresh, persistance
- **`src/pages/Authentication/auth-login.jsx`** – Page de connexion (formulaire, redirect après login)
- **`src/services/authService.js`** – Appels API login, logout, getProfile, changePassword, refreshToken
- **`src/services/api.js`** – Instance Axios, intercepteurs (injection du token, gestion 401, refresh)

## Flux de connexion

1. L’utilisateur saisit email / mot de passe (et optionnellement coche « Se souvenir de moi »).
2. `authService.login()` envoie les données à l’API.
3. En cas de succès, `AuthContext.login(user, token, rememberMe)` est appelé.
4. **Persistance** :
   - **Se souvenir de moi coché** : token et user en **localStorage** + cookie optionnel (expiration 7 jours).
   - **Non coché** : token et user en **sessionStorage** uniquement (perdus à la fermeture de l’onglet).
5. La préférence « Se souvenir de moi » est enregistrée dans `localStorage` sous la clé `applyons_remember_me` pour pré-remplir la case au prochain passage sur la page de login.
6. Redirection : vers l’URL fournie dans le paramètre `redirect` si elle est valide (et non une page `/auth/*`), sinon vers `/`.

## Redirection après connexion

- Lorsqu’un utilisateur non connecté (ou dont le token a expiré) tente d’accéder à une page protégée, il est redirigé vers `/auth/login` avec un paramètre **`redirect`** contenant l’URL demandée (ex. `?redirect=%2Forganisations%2Fdemandes-authentification%2F123`).
- Après un login réussi, la page de login lit `redirect` et envoie l’utilisateur vers cette URL avec `navigate(redirect, { replace: true })`.
- **Sécurité** : on n’utilise `redirect` que s’il commence par `/` et ne commence pas par `//` ou par `/auth` (éviter les redirections vers d’autres domaines ou vers les pages d’auth).

Voir aussi [03 - Routing et protection](03-ROUTING-ET-PROTECTION.md) pour où le paramètre `redirect` est construit.

## « Se souvenir de moi »

- **Coché** : `persistAuth(user, token, true)` → stockage en **localStorage** ; cookie utilisateur avec expiration (7 jours).
- **Décoché** : `persistAuth(user, token, false)` → stockage en **sessionStorage** ; localStorage vidé pour token/user.
- Au **chargement** de l’app, le token est récupéré dans l’ordre : `localStorage.getItem("token")` puis `sessionStorage.getItem("token")`.
- L’**intercepteur** dans `api.js` lit le token dans les deux stockages (`localStorage.getItem("token") || sessionStorage.getItem("token")`) et, en cas de 401 après échec du refresh, purge les deux.

## Expiration du token (401)

- L’intercepteur Axios dans `api.js` détecte une réponse **401** sur une route protégée.
- Il tente d’abord un **refresh** via `POST /auth/refresh-token` (si pas déjà en retry).
- Si le refresh réussit : le nouveau token est enregistré dans le **même** stockage que l’ancien (localStorage ou sessionStorage) et la requête initiale est rejouée.
- Si le refresh échoue ou si la requête était déjà en retry : purge de token/user (localStorage + sessionStorage), puis redirection vers `/auth/login` avec le paramètre **`redirect`** égal à l’URL actuelle (pathname + search), sauf si cette URL est une page `/auth/*`.

## Déconnexion

- `AuthContext.logout()` appelle l’API logout puis `persistAuth(null, null)` (suppression token/user dans localStorage et sessionStorage).
- Redirection vers `/auth/login` sans paramètre `redirect`.

## Hooks

- **`useAuth()`** (depuis `src/hooks/useAuth.ts` ou le contexte) expose : `user`, `token`, `isAuthenticated`, `loading`, `login`, `logout`, `refreshProfile`, etc.
