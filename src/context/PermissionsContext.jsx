/* eslint-disable react/prop-types */
"use client";
import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "./AuthContext";
import permissionService from "../services/permissionService";

export const PermissionsContext = createContext(undefined);

/**
 * Provider pour gérer les permissions de manière dynamique
 * Charge les permissions depuis l'API et les synchronise avec l'utilisateur connecté
 */
export const PermissionsProvider = ({ children }) => {
  const { t } = useTranslation();
  
  // Utiliser useContext directement pour éviter l'erreur si AuthProvider n'est pas encore monté
  const authContext = useContext(AuthContext);
  
  // Si le contexte n'est pas disponible, utiliser des valeurs par défaut
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  
  const [permissions, setPermissions] = useState([]);
  const [permissionKeys, setPermissionKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Charge toutes les permissions depuis l'API
   */
  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions([]);
      setPermissionKeys([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await permissionService.list({ limit: 1000 });
      const data = response?.data || response;
      const permsList = Array.isArray(data.permissions)
        ? data.permissions
        : Array.isArray(data)
        ? data
        : [];
      // console.log(permsList);
      setPermissions(permsList);

      // Créer un map pour accès rapide par clé
      const keysMap = permsList.reduce((acc, perm) => {
        acc[perm.key] = perm;
        return acc;
      }, {});
      setPermissionKeys(Object.keys(keysMap));
    } catch (err) {
      console.error("Erreur lors du chargement des permissions:", err);
      setError(err?.response?.data?.message || err?.message || "Erreur de chargement");
      setPermissions([]);
      setPermissionKeys([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Recharge les permissions (utile après création/modification)
   */
  const refreshPermissions = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Récupère les permissions de l'utilisateur connecté
   */
  const getUserPermissions = useMemo(() => {
    if (!user?.permissions) return [];
    return Array.isArray(user.permissions) ? user.permissions : [];
  }, [user]);

  /**
   * Vérifie si l'utilisateur est SUPER_ADMIN
   */
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
    return roles.includes("SUPER_ADMIN");
  }, [user]);

  /**
   * Récupère les clés de permissions de l'utilisateur
   */
  const getUserPermissionKeys = useMemo(() => {
    // Si SUPER_ADMIN, retourner toutes les clés de permissions disponibles
    if (isSuperAdmin) {
      return permissionKeys;
    }
    const userPerms = getUserPermissions;
    return userPerms.map((p) => (typeof p === "string" ? p : p.key)).filter(Boolean);
  }, [getUserPermissions, isSuperAdmin, permissionKeys]);

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = useCallback(
    (permissionKey) => {
      if (!permissionKey) return false;
      // SUPER_ADMIN a accès à tout
      if (isSuperAdmin) return true;
      return getUserPermissionKeys.includes(permissionKey);
    },
    [getUserPermissionKeys, isSuperAdmin]
  );

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   */
  const hasAnyPermission = useCallback(
    (permissionKeys = []) => {
      if (!permissionKeys?.length) return true;
      // SUPER_ADMIN a accès à tout
      if (isSuperAdmin) return true;
      return permissionKeys.some((key) => hasPermission(key));
    },
    [hasPermission, isSuperAdmin]
  );

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   */
  const hasAllPermissions = useCallback(
    (permissionKeys = []) => {
      if (!permissionKeys?.length) return true;
      // SUPER_ADMIN a accès à tout
      if (isSuperAdmin) return true;
      return permissionKeys.every((key) => hasPermission(key));
    },
    [hasPermission, isSuperAdmin]
  );

  /**
   * Récupère une permission par sa clé depuis la liste complète
   */
  const getPermissionByKey = useCallback(
    (key) => {
      return permissions.find((p) => p.key === key) || null;
    },
    [permissions]
  );

  /**
   * Récupère le label d'une permission avec traduction i18n
   */
  const getPermissionLabel = useCallback(
    (key) => {
      if (!key) return key;
      // Essayer d'abord la traduction i18n
      const translationKey = `permissions.${key}`;
      const translated = t(translationKey);
      if (translated && translated !== translationKey) {
        return translated;
      }
      // Sinon, utiliser le nom de la permission depuis le backend
      const perm = getPermissionByKey(key);
      return perm?.name || key;
    },
    [getPermissionByKey, t]
  );

  /**
   * Filtre les permissions selon un rôle spécifique
   * Si allowedRoles est null/undefined, la permission est accessible à tous les rôles
   * Si allowedRoles est un tableau, vérifie si le rôle est inclus
   * SUPER_ADMIN a accès à toutes les permissions
   */
  const getPermissionsByRole = useCallback(
    (role) => {
      if (!role) return permissions;
      // SUPER_ADMIN a accès à toutes les permissions
      if (role === "SUPER_ADMIN") return permissions;
      return permissions.filter((perm) => {
        // Si allowedRoles est null/undefined, accessible à tous
        if (!perm.allowedRoles || perm.allowedRoles === null) return true;
        // Si c'est un tableau, vérifier si le rôle est inclus
        if (Array.isArray(perm.allowedRoles)) {
          return perm.allowedRoles.includes(role);
        }
        // Si c'est une string (cas JSON), parser
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
    },
    [permissions]
  );

  /**
   * Charge les permissions au montage et quand l'utilisateur change
   * Les permissions de l'utilisateur viennent directement de user.permissions (backend)
   * On charge aussi la liste complète des permissions pour les labels
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions(); // Charge la liste complète pour les labels
      // Les permissions de l'utilisateur sont déjà dans user.permissions (depuis le backend)
    } else {
      setPermissions([]);
      setPermissionKeys([]);
    }
  }, [isAuthenticated, user?.id, user?.permissions, fetchPermissions]); // Recharger quand l'utilisateur ou ses permissions changent

  const value = useMemo(
    () => ({
      // Liste complète des permissions disponibles dans le système
      permissions,
      permissionKeys,
      
      // Permissions de l'utilisateur connecté
      userPermissions: getUserPermissions,
      userPermissionKeys: getUserPermissionKeys,
      
      // Fonctions de vérification
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      
      // Fonctions utilitaires
      getPermissionByKey,
      getPermissionLabel,
      getPermissionsByRole,
      
      // Actions
      refreshPermissions,
      
      // État
      loading,
      error,
    }),
    [
      permissions,
      permissionKeys,
      getUserPermissions,
      getUserPermissionKeys,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      getPermissionByKey,
      getPermissionLabel,
      getPermissionsByRole,
      refreshPermissions,
      loading,
      error,
    ]
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};
