# Guide : Permissions et Rôles (allowedRoles)

## Vue d'ensemble

Le système de permissions supporte maintenant l'association de permissions à des rôles spécifiques via le champ `allowedRoles`. Cela permet de restreindre l'accès à certaines permissions selon le rôle de l'utilisateur.

## Structure Backend

### Schéma Prisma

```prisma
model Permission {
  id           String   @id @default(uuid())
  key          String   @unique
  name         String
  description  String?
  allowedRoles Json?    // Tableau de rôles : ["ADMIN", "INSTITUT", ...] ou null pour tous
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Comportement

- **`allowedRoles = null`** : La permission est accessible à **tous les rôles**
- **`allowedRoles = ["ADMIN", "INSTITUT"]`** : La permission est accessible **uniquement** aux rôles ADMIN et INSTITUT
- **`allowedRoles = []`** : Équivalent à `null` (accessible à tous)

## Utilisation Frontend

### 1. Contexte des Permissions

Le `PermissionsContext` fournit la fonction `getPermissionsByRole(role)` pour filtrer les permissions :

```jsx
import { usePermissions } from "../hooks/usePermissions";

function MyComponent() {
  const { getPermissionsByRole } = usePermissions();
  
  // Obtenir les permissions pour un rôle spécifique
  const adminPermissions = getPermissionsByRole("ADMIN");
  const institutPermissions = getPermissionsByRole("INSTITUT");
}
```

### 2. Formulaires de Création/Modification d'Utilisateurs

Les formulaires filtrent automatiquement les permissions selon le rôle sélectionné :

#### Admin - Création/Modification (`user-create.jsx`, `user-edit.jsx`)

```jsx
const selectedRole = Form.useWatch("role", form);
const filteredPermissions = selectedRole 
    ? getPermissionsByRole(selectedRole)
    : permissions;

const permissionsOptions = filteredPermissions.map((perm) => ({
    label: getPermissionLabel(perm.key) || perm.name || perm.key,
    value: perm.key,
}));
```

**Comportement :**
- Quand l'utilisateur sélectionne un rôle, seules les permissions autorisées pour ce rôle sont affichées
- Si aucune permission n'est autorisée pour le rôle, la liste est vide
- Les permissions avec `allowedRoles = null` apparaissent pour tous les rôles

#### Institut - Création/Modification (`UserCreateInstitut.jsx`, `UserEditInstitut.jsx`)

```jsx
const userRole = me?.role || "INSTITUT";
const filteredPermissions = getPermissionsByRole(userRole);
```

**Comportement :**
- Les permissions sont filtrées selon le rôle de l'utilisateur connecté
- Un utilisateur INSTITUT ne verra que les permissions autorisées pour INSTITUT

### 3. Gestion des Permissions (Admin)

La page `PermissionsList.jsx` permet de :

1. **Créer une permission avec rôles spécifiques :**
   - Champ `allowedRoles` : Select multiple avec les rôles disponibles
   - Si aucun rôle n'est sélectionné → `allowedRoles = null` (accessible à tous)

2. **Modifier les rôles d'une permission :**
   - Le formulaire pré-remplit les rôles existants
   - Permet d'ajouter/supprimer des rôles

3. **Visualiser les rôles autorisés :**
   - Colonne "Rôles autorisés" dans le tableau
   - Affiche "Tous les rôles" si `allowedRoles = null`
   - Affiche les tags des rôles si spécifiés

## Exemples d'utilisation

### Exemple 1 : Permission pour tous les rôles

```json
{
  "key": "users.read",
  "name": "Lire les utilisateurs",
  "allowedRoles": null
}
```
→ Accessible à ADMIN, INSTITUT, TRADUCTEUR, DEMANDEUR, etc.

### Exemple 2 : Permission uniquement pour ADMIN

```json
{
  "key": "permissions.manage",
  "name": "Gérer les permissions",
  "allowedRoles": ["ADMIN", "SUPER_ADMIN"]
}
```
→ Accessible uniquement aux ADMIN et SUPER_ADMIN

### Exemple 3 : Permission pour INSTITUT et SUPERVISEUR

```json
{
  "key": "demandes.manage",
  "name": "Gérer les demandes",
  "allowedRoles": ["INSTITUT", "SUPERVISEUR"]
}
```
→ Accessible uniquement aux INSTITUT et SUPERVISEUR

## Fonctionnement du Filtrage

### Dans le Contexte (`PermissionsContext.jsx`)

```jsx
const getPermissionsByRole = useCallback((role) => {
  if (!role) return permissions;
  return permissions.filter((perm) => {
    // Si allowedRoles est null/undefined, accessible à tous
    if (!perm.allowedRoles || perm.allowedRoles === null) return true;
    
    // Si c'est un tableau, vérifier si le rôle est inclus
    if (Array.isArray(perm.allowedRoles)) {
      return perm.allowedRoles.includes(role);
    }
    
    // Si c'est une string (JSON), parser
    if (typeof perm.allowedRoles === "string") {
      try {
        const roles = JSON.parse(perm.allowedRoles);
        return Array.isArray(roles) && roles.includes(role);
      } catch {
        return false;
      }
    }
    
    return false;
  });
}, [permissions]);
```

### Dans les Formulaires

Les formulaires utilisent `Form.useWatch("role", form)` pour observer le changement de rôle et mettre à jour dynamiquement la liste des permissions disponibles.

## Synchronisation

Le système se synchronise automatiquement :

1. **Au chargement** : Les permissions sont chargées depuis l'API
2. **Quand le rôle change** : Les permissions sont filtrées en temps réel
3. **Après modification** : `refreshPermissions()` recharge les permissions depuis l'API
4. **Quand l'utilisateur change** : Le contexte se met à jour via `user?.permissions`

## Traductions

Toutes les traductions ont été ajoutées dans les 6 langues :

- `adminPermissions.columns.allowedRoles` : "Rôles autorisés"
- `adminPermissions.allRoles` : "Tous les rôles"
- `adminPermissions.form.allowedRoles` : "Rôles autorisés"
- `adminPermissions.form.allowedRolesPlaceholder` : "Sélectionner les rôles..."
- `adminPermissions.form.allowedRolesHelp` : "Si aucun rôle n'est sélectionné..."

## Avantages

1. **Sécurité** : Les utilisateurs ne peuvent assigner que les permissions autorisées pour leur rôle
2. **UX** : Interface simplifiée - seules les permissions pertinentes sont affichées
3. **Flexibilité** : Les permissions peuvent être restreintes ou ouvertes selon les besoins
4. **Dynamique** : Les changements dans le backend sont immédiatement reflétés dans l'interface

## Migration

Les permissions existantes sans `allowedRoles` sont traitées comme accessibles à tous les rôles (`null`).

Pour migrer :
1. Les permissions existantes fonctionnent normalement (accessibles à tous)
2. Vous pouvez progressivement ajouter `allowedRoles` aux permissions qui doivent être restreintes
3. Le système est rétrocompatible
