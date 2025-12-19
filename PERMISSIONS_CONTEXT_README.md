# Contexte des Permissions - Guide d'utilisation

## Vue d'ensemble

Le `PermissionsContext` permet de gérer les permissions de manière dynamique dans l'application. Il charge automatiquement les permissions depuis l'API et se synchronise avec l'utilisateur connecté.

## Installation

Le contexte est déjà intégré dans `main.jsx` :

```jsx
<AuthProvider>
  <PermissionsProvider>
    <App />
  </PermissionsProvider>
</AuthProvider>
```

## Utilisation

### Hook `usePermissions`

```jsx
import { usePermissions } from "../hooks/usePermissions";

function MyComponent() {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    userPermissionKeys,
    permissions,
    getPermissionLabel,
    refreshPermissions 
  } = usePermissions();

  // Vérifier une permission spécifique
  if (hasPermission('users.read')) {
    // Afficher le bouton
  }

  // Vérifier plusieurs permissions (au moins une)
  if (hasAnyPermission(['users.read', 'users.manage'])) {
    // Afficher le menu
  }

  // Vérifier toutes les permissions
  if (hasAllPermissions(['users.read', 'users.manage'])) {
    // Action nécessitant toutes les permissions
  }

  // Obtenir le label d'une permission
  const label = getPermissionLabel('users.read'); // "Lire les utilisateurs"

  // Rafraîchir les permissions après modification
  const handleUpdate = async () => {
    await updatePermission();
    await refreshPermissions(); // Recharge depuis l'API
  };
}
```

## Propriétés disponibles

### Données

- `permissions`: Liste complète des permissions disponibles dans le système
- `permissionKeys`: Tableau des clés de permissions disponibles
- `userPermissions`: Permissions de l'utilisateur connecté (objets complets)
- `userPermissionKeys`: Clés de permissions de l'utilisateur connecté (tableau de strings)

### Fonctions de vérification

- `hasPermission(key)`: Vérifie si l'utilisateur a une permission spécifique
- `hasAnyPermission(keys[])`: Vérifie si l'utilisateur a au moins une des permissions
- `hasAllPermissions(keys[])`: Vérifie si l'utilisateur a toutes les permissions

### Fonctions utilitaires

- `getPermissionByKey(key)`: Récupère un objet permission par sa clé
- `getPermissionLabel(key)`: Récupère le label (nom) d'une permission
- `refreshPermissions()`: Recharge les permissions depuis l'API

### État

- `loading`: Indique si les permissions sont en cours de chargement
- `error`: Message d'erreur éventuel

## Exemples d'utilisation

### 1. Conditionner l'affichage d'un bouton

```jsx
function UserActions() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('users.read') && (
        <Button>Voir les utilisateurs</Button>
      )}
      {hasPermission('users.manage') && (
        <Button>Gérer les utilisateurs</Button>
      )}
    </div>
  );
}
```

### 2. Filtrer un menu selon les permissions

```jsx
function Sidebar() {
  const { hasAnyPermission } = usePermissions();

  const menuItems = [
    { 
      label: 'Utilisateurs', 
      to: '/users',
      permissions: ['users.read', 'users.manage']
    },
    // ...
  ];

  const visibleItems = menuItems.filter(item => 
    hasAnyPermission(item.permissions)
  );
}
```

### 3. Rafraîchir après modification

```jsx
function PermissionsList() {
  const { refreshPermissions } = usePermissions();

  const handleCreate = async (data) => {
    await permissionService.create(data);
    await refreshPermissions(); // Met à jour le contexte
    message.success('Permission créée');
  };
}
```

### 4. Afficher les permissions de l'utilisateur

```jsx
function UserProfile() {
  const { userPermissionKeys, getPermissionLabel } = usePermissions();

  return (
    <div>
      <h3>Mes permissions</h3>
      <ul>
        {userPermissionKeys.map(key => (
          <li key={key}>{getPermissionLabel(key)}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Synchronisation automatique

Le contexte se synchronise automatiquement avec :
- L'authentification : recharge quand l'utilisateur se connecte/déconnecte
- Le profil utilisateur : se met à jour quand `user.id` change
- Les modifications : utilisez `refreshPermissions()` après création/modification/suppression

## Avantages

1. **Dynamique** : Les permissions sont chargées depuis l'API, pas en dur
2. **Réactif** : Se met à jour automatiquement quand l'utilisateur change
3. **Centralisé** : Une seule source de vérité pour les permissions
4. **Performant** : Cache les permissions et évite les appels API répétés
5. **Type-safe** : Utilise TypeScript pour une meilleure sécurité de type

## Migration depuis l'ancien système

### Avant (en dur)

```jsx
const PERMS = {
  USERS_READ: "users.read",
  // ...
};

if (user.permissions?.some(p => p.key === PERMS.USERS_READ)) {
  // ...
}
```

### Après (avec contexte)

```jsx
const { hasPermission } = usePermissions();

if (hasPermission('users.read')) {
  // ...
}
```

## Notes importantes

- Le contexte dépend de `AuthContext` : assurez-vous que `PermissionsProvider` est à l'intérieur de `AuthProvider`
- Les permissions sont chargées une fois au montage et se mettent à jour automatiquement
- Utilisez `refreshPermissions()` après toute modification pour synchroniser immédiatement
- Le contexte gère les erreurs silencieusement pour ne pas bloquer l'application
