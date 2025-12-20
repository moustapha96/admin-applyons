# Migration vers les Permissions Dynamiques du Backend

## Vue d'ensemble

Toutes les pages de création et modification d'utilisateurs utilisent maintenant les permissions chargées dynamiquement depuis le backend au lieu des constantes en dur.

## Fichiers modifiés

✅ **Admin:**
- `src/pages/Admin/Users/user-create.jsx`
- `src/pages/Admin/Users/user-edit.jsx`

✅ **Institut:**
- `src/pages/Institut/Users/UserCreateInstitut.jsx`
- `src/pages/Institut/Users/UserEditInstitut.jsx`

## Changements effectués

### Avant (permissions en dur)

```jsx
import { PERMS } from "../../../auth/permissions";
import { getPermissionLabel } from "../../../auth/permissions";

const permissionsOptions = Object.entries(PERMS).map(([key, value]) => ({
    label: getPermissionLabel(value, t),
    value: value,
}));
```

### Après (permissions du backend)

```jsx
import { usePermissions } from "../../../hooks/usePermissions";

const { permissions, getPermissionLabel, loading: permissionsLoading } = usePermissions();

// Utiliser les permissions du backend au lieu des constantes
const permissionsOptions = permissions.map((perm) => ({
    label: getPermissionLabel(perm.key) || perm.name || perm.key,
    value: perm.key,
}));
```

## Avantages

1. **Dynamique** : Les permissions sont chargées depuis la base de données
2. **À jour** : Les nouvelles permissions créées dans le backend apparaissent automatiquement
3. **Centralisé** : Une seule source de vérité (la base de données)
4. **Réactif** : Se met à jour automatiquement quand les permissions changent

## Comment ça fonctionne

1. Le `PermissionsContext` charge toutes les permissions depuis `/api/permissions` au démarrage
2. Les permissions de l'utilisateur connecté viennent de `user.permissions` (déjà dans le contexte d'authentification)
3. Le contexte se synchronise automatiquement quand l'utilisateur change
4. Les pages utilisent `usePermissions()` pour accéder aux permissions disponibles

## Utilisation dans les formulaires

### Exemple avec état de chargement

```jsx
<Form.Item name="permissions" label="Permissions">
  {permissionsLoading ? (
    <div>Chargement des permissions...</div>
  ) : (
    <Checkbox.Group>
      <Row gutter={[0, 16]}>
        {permissionsOptions.map((option) => (
          <Col span={8} key={option.value}>
            <Checkbox value={option.value}>{option.label}</Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  )}
</Form.Item>
```

## Synchronisation

Le contexte se met à jour automatiquement :
- Au chargement de l'application
- Quand l'utilisateur se connecte/déconnecte
- Quand `user.permissions` change
- Après création/modification/suppression de permissions (via `refreshPermissions()`)

## Prochaines étapes

Pour migrer d'autres fichiers qui utilisent encore `PERMS` ou `PERMS_INSTITUT` :

1. Remplacer l'import :
   ```jsx
   // Avant
   import { PERMS } from "../../../auth/permissions";
   
   // Après
   import { usePermissions } from "../../../hooks/usePermissions";
   ```

2. Utiliser le hook :
   ```jsx
   const { permissions, getPermissionLabel } = usePermissions();
   ```

3. Créer les options :
   ```jsx
   const permissionsOptions = permissions.map((perm) => ({
     label: getPermissionLabel(perm.key) || perm.name || perm.key,
     value: perm.key,
   }));
   ```

## Fichiers à migrer (si nécessaire)

Les fichiers suivants utilisent encore `PERMS` ou `PERMS_INSTITUT` :
- `src/pages/Admin/Users/user-details.jsx` (si affichage de permissions)
- `src/pages/Institut/Users/UserDetailInstitut.jsx` (si affichage de permissions)
- `src/pages/Institut/Users/EditUserPermissions.jsx` (si existe)
- Autres fichiers qui affichent ou gèrent des permissions

## Notes importantes

- Les permissions sont maintenant **dynamiques** : elles viennent de la base de données
- Les constantes `PERMS`, `PERMS_INSTITUT`, etc. peuvent être conservées pour la compatibilité mais ne sont plus utilisées dans les formulaires
- Le contexte gère automatiquement le chargement et la mise à jour
- Utilisez `refreshPermissions()` après toute modification de permissions pour synchroniser immédiatement
