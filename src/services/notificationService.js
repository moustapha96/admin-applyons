import axiosInstance from "./api";

/**
 * Récupère les notifications du backend pour l'utilisateur connecté.
 * 
 * On part du principe que le backend expose une route REST du type :
 *  - GET /notifications          -> toutes les notifs de l'utilisateur courant
 *    ou
 *  - GET /notifications?role=XX  -> filtrage côté backend
 *
 * Adaptez l'URL et la transformation des données selon votre API réelle.
 */
/**
 * Récupère une page de notifications (pour la page dédiée demandeur).
 * Retourne { notifications, pagination }.
 */
export async function fetchNotificationsPage(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `/notifications?${queryParams}` : "/notifications";
  const data = await axiosInstance.get(url);
  const list = (data.notifications || data || []).map((n) => ({
    id: n.id,
    type: n.type || "info",
    title: n.title,
    message: n.message,
    createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
    read: Boolean(n.read),
    isBroadcast: Boolean(n.isBroadcast),
    link: n.link || undefined,
    entityType: n.entityType,
    entityId: n.entityId,
    demandeId: n.demandeId,
    documentId: n.documentId,
    demandeAuthentificationId: n.demandeAuthentificationId,
  }));
  return {
    notifications: list,
    pagination: data.pagination || { page: 1, limit: 20, total: list.length, pages: 1 },
  };
}

export async function fetchNotifications(params = {}) {
  // Exemple : vous pouvez passer { role: "DEMANDEUR" } ou { role: "INSTITUT" }
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `/notifications?${queryParams}` : "/notifications";

  const data = await axiosInstance.get(url);

  // On normalise la structure attendue par le composant Topnav (demandeur = Notification, institut = OrganizationDemandeNotification).
  return (data.notifications || data || []).map((n) => ({
    id: n.id,
    type: n.type || "info",
    titleKey: n.titleKey || n.title || "notifications.genericTitle",
    messageKey: n.messageKey || n.message || "notifications.genericMessage",
    title: n.title,
    message: n.message,
    createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
    read: Boolean(n.read),
    isBroadcast: Boolean(n.isBroadcast),
    link: n.link || undefined,
    entityType: n.entityType,
    entityId: n.entityId,
    demandeId: n.demandeId,
    documentId: n.documentId,
    demandeAuthentificationId: n.demandeAuthentificationId,
  }));
}

/**
 * Marque une notification comme lue côté backend.
 * Adaptez la méthode/URL selon votre API (PATCH, PUT, etc.).
 */
export async function markNotificationAsRead(id) {
  if (!id) return;
  try {
    // ⚠️ Route plus standard REST : PUT /notifications/:id  (ou PATCH)
    // On envoie simplement { read: true } au backend.
    await axiosInstance.put(`/notifications/${id}`, { read: true });
  } catch (e) {
    // On ne bloque pas l'UI si l'appel échoue, mais on log pour debug.
    // eslint-disable-next-line no-console
    console.error("Erreur lors du marquage de la notification comme lue :", e);
  }
}

/**
 * Marque toutes les notifications comme lues côté backend.
 */
export async function markAllNotificationsAsRead() {
  try {
    // Route plus générique pour tout marquer comme lu.
    await axiosInstance.put("/notifications/read-all");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Erreur lors du marquage de toutes les notifications comme lues :", e);
  }
}

/**
 * Envoi d'une notification en masse (admin).
 * audience: "ALL_DEMANDEURS" | "ALL_INSTITUTS" | "BY_ORG_TYPE"
 * orgType: requis si audience === "BY_ORG_TYPE" (ex: "INSTITUT", "COLLEGE", "UNIVERSITE", ...)
 */
export async function sendBroadcastNotification(payload) {
  // axiosInstance renvoie déjà res.data (intercepteur) : { success, sentCount, audience, orgType }
  return await axiosInstance.post("/notifications/broadcast", payload);
}


