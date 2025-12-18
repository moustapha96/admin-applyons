export const PERMS = {
  USERS_READ: "users.read",
  USERS_MANAGE: "users.manage",
  // USERS_IMPERSONATE: "users.impersonate",
  ORGS_READ: "organizations.read",
  ORGS_MANAGE: "organizations.manage",
  ORGS_WRITE: "organizations.write",
  DEPTS_READ: "departments.read",
  DEPTS_MANAGE: "departments.manage",
  FILS_READ: "filieres.read",
  FILS_MANAGE: "filieres.manage",
  DEMANDES_READ: "demandes.read",
  DEMANDES_MANAGE: "demandes.manage",
  DOCS_READ: "documents.read",
  DOCS_CREATE: "documents.create",
  DOCS_UPDATE: "documents.update",
  DOCS_DELETE: "documents.delete",
  DOCS_TRANSLATE: "documents.translate",
  DOCS_VERIFY: "documents.verify",
  PAY_READ: "payments.read",
  PAY_MANAGE: "payments.manage",
  TRX_READ: "transactions.read",
  TRX_MANAGE: "transactions.manage",
  ABOS_READ: "abonnements.read",
  ABOS_MANAGE: "abonnements.manage",
  INVITES_READ: "invites.read",
  INVITES_MANAGE: "invites.manage",
  CONTACTS_READ: "contacts.read",
  CONTACTS_MANAGE: "contacts.manage",
  SETTINGS_READ: "settings.read",
  SETTINGS_MANAGE: "settings.manage",
  CONFIG_READ: "config.read",
  CONFIG_MANAGE: "config.manage",
  UPLOADS_CREATE: "uploads.create",
  DASHBOARD_READ: "dashboard.read",
  AUDIT_READ: "audit.read",
  AUDIT_MANAGE: "audit.manage",
  ORGANIZATION_DEMANDE_NOTIFICATIONS_READ: "organizationDemandeNotifications.read",
  ORGANIZATION_DEMANDE_NOTIFICATIONS_MANAGE: "organizationDemandeNotifications.manage",
  PERMISSIONS_READ: "permissions.read",
  PERMISSIONS_MANAGE: "permissions.manage",
};

export const PERMS_INSTITUT = {
  USERS_READ: "users.read",
  USERS_MANAGE: "users.manage",
  // USERS_IMPERSONATE: "users.impersonate",
  ORGS_READ: "organizations.read",
  ORGS_MANAGE: "organizations.manage",
  ORGS_WRITE: "organizations.write",
  DEPTS_READ: "departments.read",
  DEPTS_MANAGE: "departments.manage",
  FILS_READ: "filieres.read",
  FILS_MANAGE: "filieres.manage",
  DEMANDES_READ: "demandes.read",
  DEMANDES_MANAGE: "demandes.manage",
  DOCS_READ: "documents.read",
  DOCS_CREATE: "documents.create",
  // DOCS_UPDATE: "documents.update",
  DOCS_DELETE: "documents.delete",
  // DOCS_TRANSLATE: "documents.translate",
  // DOCS_VERIFY: "documents.verify",
  PAY_READ: "payments.read",
  PAY_MANAGE: "payments.manage",
  TRX_READ: "transactions.read",
  TRX_MANAGE: "transactions.manage",
  ABOS_READ: "abonnements.read",
  ABOS_MANAGE: "abonnements.manage",
  UPLOADS_CREATE: "uploads.create",
  DASHBOARD_READ: "dashboard.read",
  INVITES_READ: "invites.read",
  INVITES_MANAGE: "invites.manage",
  ORGANIZATION_DEMANDE_NOTIFICATIONS_READ: "organizationDemandeNotifications.read",
  ORGANIZATION_DEMANDE_NOTIFICATIONS_MANAGE: "organizationDemandeNotifications.manage",
  PERMISSIONS_READ: "permissions.read",
  PERMISSIONS_MANAGE: "permissions.manage",
};

export const PERMS_TRADUCTEUR = {
  USERS_READ: "users.read",
  USERS_MANAGE: "users.manage",
  DEMANDES_READ: "demandes.read",
  DEMANDES_MANAGE: "demandes.manage",
  DOCS_READ: "documents.read",
  DOCS_UPDATE: "documents.update",
  DOCS_DELETE: "documents.delete",
  DOCS_TRANSLATE: "documents.translate",
  DASHBOARD_READ: "dashboard.read",
  ORGANIZATION_DEMANDE_NOTIFICATIONS_READ: "organizationDemandeNotifications.read",
  ORGANIZATION_DEMANDE_NOTIFICATIONS_MANAGE: "organizationDemandeNotifications.manage",
  PERMISSIONS_READ: "permissions.read",
  PERMISSIONS_MANAGE: "permissions.manage",
};
// organizations.write
// Fonction pour obtenir le label d'une permission à partir de sa clé
type PermissionKey =
  | "users.read"
  | "users.manage"
  | "users.impersonate"
  | "organizations.read"
  | "organizations.manage"
  | "departments.read"
  | "departments.manage"
  | "filieres.read"
  | "filieres.manage"
  | "demandes.read"
  | "demandes.manage"
  | "documents.read"
  | "documents.create"
  | "documents.update"
  | "documents.delete"
  | "documents.translate"
  | "documents.verify"
  | "payments.read"
  | "payments.manage"
  | "transactions.read"
  | "transactions.manage"
  | "abonnements.read"
  | "abonnements.manage"
  | "invites.read"
  | "invites.manage"
  | "contacts.read"
  | "contacts.manage"
  | "settings.read"
  | "settings.manage"
  | "config.read"
  | "config.manage"
  | "uploads.create"
  | "dashboard.read"
  | "organizations.write"
  | "audit.read"
  | "audit.manage"
  | "organizationDemandeNotifications.read"
  | "organizationDemandeNotifications.manage"
  | "permissions.read"
  | "permissions.manage";

// Fallback labels en français (utilisés si i18n n'est pas disponible)
const fallbackLabels: Record<PermissionKey, string> = {
  "users.read": "Lire les utilisateurs",
  "users.manage": "Gérer les utilisateurs",
  "users.impersonate": "Impersonner les utilisateurs",
  "organizations.read": "Lire les organisations",
  "organizations.manage": "Gérer les organisations",
  "organizations.write": "Modifier les organisations",
  "departments.read": "Lire les départements",
  "departments.manage": "Gérer les départements",
  "filieres.read": "Lire les filières",
  "filieres.manage": "Gérer les filières",
  "demandes.read": "Lire les demandes",
  "demandes.manage": "Gérer les demandes",
  "documents.read": "Lire les documents",
  "documents.create": "Créer des documents",
  "documents.update": "Mettre à jour les documents",
  "documents.delete": "Supprimer les documents",
  "documents.translate": "Traduire les documents",
  "documents.verify": "Vérifier les documents",
  "payments.read": "Lire les paiements",
  "payments.manage": "Gérer les paiements",
  "transactions.read": "Lire les transactions",
  "transactions.manage": "Gérer les transactions",
  "abonnements.read": "Lire les abonnements",
  "abonnements.manage": "Gérer les abonnements",
  "invites.read": "Lire les invitations",
  "invites.manage": "Gérer les invitations",
  "contacts.read": "Lire les contacts",
  "contacts.manage": "Gérer les contacts",
  "settings.read": "Lire les paramètres",
  "settings.manage": "Gérer les paramètres",
  "config.read": "Lire la configuration",
  "config.manage": "Gérer la configuration",
  "uploads.create": "Créer des uploads",
  "dashboard.read": "Lire le tableau de bord",
  "audit.read": "Lire les logs d'audit",
  "audit.manage": "Gérer les logs d'audit",
  "organizationDemandeNotifications.read": "Lire les notifications de demandes",
  "organizationDemandeNotifications.manage": "Gérer les notifications de demandes",
  "permissions.read": "Lire les permissions",
  "permissions.manage": "Gérer les permissions",
};

export const getPermissionLabel = (key: string, t?: (key: string) => string) => {
  // Si une fonction de traduction est fournie, l'utiliser
  if (t) {
    const translationKey = `permissions.${key}`;
    const translated = t(translationKey);
    // Si la traduction existe et n'est pas égale à la clé, la retourner
    if (translated && translated !== translationKey) {
      return translated;
    }
  }
  // Sinon, utiliser les labels de fallback
  return fallbackLabels[key as PermissionKey] || key;
};

// Fonction pour obtenir le label d'un rôle
export const getRoleLabel = (role: string, t?: (key: string) => string): string => {
  const fallbackLabels: Record<string, string> = {
    ADMIN: "Administrateur",
    SUPER_ADMIN: "Super Administrateur",
    INSTITUT: "Institution",
    SUPERVISEUR: "Superviseur",
    TRADUCTEUR: "Traducteur",
    DEMANDEUR: "Demandeur",
    UTILISATEUR: "Utilisateur",
  };
  
  if (t) {
    const translationKey = `roles.labels.${role}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
  }
  
  return fallbackLabels[role] || role;
};

// Fonction pour obtenir la couleur d'une permission selon sa catégorie
export const getPermissionColor = (key: string): string => {
  const colors: Record<
    "users" |
    "organizations" |
    "departments" |
    "filieres" |
    "demandes" |
    "documents" |
    "payments" |
    "transactions" |
    "abonnements" |
    "invites" |
    "contacts" |
    "settings" |
    "config" |
    "audit" |
    "permissions",
    string
  > = {
    "users": "blue",
    "organizations": "purple",
    "departments": "orange",
    "filieres": "green",
    "demandes": "cyan",
    "documents": "geekblue",
    "payments": "gold",
    "transactions": "lime",
    "abonnements": "magenta",
    "invites": "red",
    "contacts": "volcano",
    "settings": "gray",
    "config": "darkgreen",
    "audit": "geekblue",
    "permissions": "purple",
  };
  const category = key.split(".")[0] as keyof typeof colors;
  return colors[category] || "default";
};
