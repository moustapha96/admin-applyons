import axiosInstance from "./api";

// Service pour le tableau de bord
export const dashboardService = {
    /**
     * Stats globales ou filtrées (si le backend accepte orgId plus tard)
     * @param {Object} params { recentDays, orgId }
     */
    getStats: (params = {}) =>
        axiosInstance.get("/dashboard/stats", { params }),

    /**
     * Stats DEMANDEUR
     * @param {Object} params { recentDays }
     */
    getDemandeurStats: (id, params = {}) =>
        axiosInstance.get(`/dashboard/${id}/demandeur/stats`, { params }),

    /**
     * Stats INSTITUT (lié à l’organizationId de l’utilisateur)
     * @param {Object} params { recentDays }
     */
    getInstitutStats: (idOrganisation, params = {}) =>
        axiosInstance.get(`/dashboard/${idOrganisation}/institut/stats`, { params }),

    /**
     * Stats TRADUCTEUR
     * @param {string} userId - ID de l'utilisateur traducteur
     * @param {Object} params { recentDays }
     */
    getTraducteurStats: (userId, params = {}) =>
        axiosInstance.get(`/dashboard/${userId}/traducteur/stats`, { params }),


    /**
     * Audit logs (paginé)
     * @param {Object} params { page=1, limit=10, action, resource, userId, startDate, endDate }
     */
    getAuditLogs: (params = {}) =>
        axiosInstance.get("/dashboard/audit-logs", { params }),

};

export default dashboardService;