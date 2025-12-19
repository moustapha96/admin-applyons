// services/organizationDemandeNotification.service.js
import axiosInstance from "./api";

// Helpers : l’API attend "true"/"false" (express-validator isIn(["true","false"]))
const toBoolString = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "string") return v; // "true"/"false"
  return v ? "true" : "false";
};

// Normalise params pour éviter d'envoyer des undefined + convert bool -> "true"/"false"
const normalizeParams = (params = {}) => {
  const p = { ...params };

  // bool flags attendus sous forme string côté backend
  if ("viewedOnly" in p) p.viewedOnly = toBoolString(p.viewedOnly);
  if ("unviewedOnly" in p) p.unviewedOnly = toBoolString(p.unviewedOnly);
  if ("asTarget" in p) p.asTarget = toBoolString(p.asTarget);
  if ("asNotified" in p) p.asNotified = toBoolString(p.asNotified);

  // retire undefined / null / "" pour garder des URLs propres
  Object.keys(p).forEach((k) => {
    if (p[k] === undefined || p[k] === null || p[k] === "") delete p[k];
  });

  return p;
};

const BASE = "/organization-demande-notifications";

const organizationDemandeNotificationService = {
  /**
   * GET /api/organization-demande-notifications
   * Admin: liste toutes les notifications
   * Params: page, limit, sortBy, sortOrder, demandePartageId, targetOrgId, notifiedOrgId, userId, viewedOnly, unviewedOnly
   */
  list(params = {}) {
    return axiosInstance.get(`${BASE}`, { params: normalizeParams(params) });
  },

  /**
   * GET /api/organization-demande-notifications/stats/global
   * Admin: statistiques globales
   */
  statsGlobal(params = {}) {
    return axiosInstance.get(`${BASE}/stats/global`, { params: normalizeParams(params) });
  },

  /**
   * PUT /api/organization-demande-notifications/view-all/global
   * Admin: marque toutes les notifications comme vues (global)
   */
  markAllAsViewedForGlobal() {
    return axiosInstance.put(`${BASE}/view-all/global`);
  },

  /**
   * GET /api/organization-demande-notifications/:id
   * http://localhost:5000/api/organization-demande-notifications/org/cmjbhfsln00109v7881cboqew
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/org/${id}`);
  },

  /**
   * GET /api/organization-demande-notifications/my-org
   * Params: asTarget, asNotified, viewedOnly, unviewedOnly, page, limit, sortBy, sortOrder
   */
  listForCurrentOrg(params = {}) {
    return axiosInstance.get(`${BASE}/my-org`, { params: normalizeParams(params) });
  },

  /**
   * GET /api/organization-demande-notifications/my-org/stats
   */
  statsForCurrentOrg() {
    return axiosInstance.get(`${BASE}/my-org/stats`);
  },

  /**
   * PUT /api/organization-demande-notifications/my-org/view-all
   */
  markAllAsViewedForCurrentOrg() {
    return axiosInstance.put(`${BASE}/my-org/view-all`);
  },

  /**
   * GET /api/organization-demande-notifications/org/:orgId
   * Admin: liste par org
   * Params: asTarget, asNotified, viewedOnly, unviewedOnly, page, limit, sortBy, sortOrder
   */
  listByOrg(orgId, params = {}) {
    return axiosInstance.get(`${BASE}/org/${orgId}`, { params: normalizeParams(params) });
  },

  /**
   * GET /api/organization-demande-notifications/org/:orgId/stats
   */
  stats(orgId) {
    return axiosInstance.get(`${BASE}/org/${orgId}/stats`);
  },

  /**
   * PUT /api/organization-demande-notifications/org/:orgId/view-all
   */
  markAllAsViewedForOrg(orgId) {
    return axiosInstance.put(`${BASE}/org/${orgId}/view-all`);
  },

  /**
   * GET /api/organization-demande-notifications/demande/:demandeId
   * Params: page, limit, sortBy, sortOrder
   */
  listByDemande(demandeId, params = {}) {
    return axiosInstance.get(`${BASE}/demande/${demandeId}`, { params: normalizeParams(params) });
  },

  /**
   * PATCH /api/organization-demande-notifications/:id/view
   */
  markAsViewed(id) {
    return axiosInstance.patch(`${BASE}/${id}/view`);
  },

  /**
   * PUT /api/organization-demande-notifications/:id/view
   */
  markAsViewedPut(id) {
    return axiosInstance.put(`${BASE}/${id}/view`);
  },

  /**
   * DELETE /api/organization-demande-notifications/:id
   */
  delete(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default organizationDemandeNotificationService;
