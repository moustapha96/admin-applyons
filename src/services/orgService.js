// import axiosInstance from "./api";

// export const orgService = {
//     getAll: async() => {
//         const response = await axiosInstance.get("/organizations");
//         return response.data;
//     },

//     get: async(id) => {
//         const response = await axiosInstance.get(`/organizations/${id}`);
//         return response.data;
//     },

//     create: async(data) => {
//         const response = await axiosInstance.post("/organizations", data);
//         return response.data;
//     },

//     update: async(id, data) => {
//         const response = await axiosInstance.put(`/organizations/${id}`, data);
//         return response.data;
//     },

//     delete: async(id) => {
//         const response = await axiosInstance.delete(`/organizations/${id}`);
//         return response.data;
//     },
// };
// export default orgService;


import axiosInstance from "./api";

export const orgService = {
    /**
     * Récupère toutes les organisations
     * @returns {Promise}
     */
    getAll: async(params = {}) => {
        const response = await axiosInstance.get("/organizations", { params });
        return response.data;
    },

    /**
     * Récupère une organisation par son ID
     * @param {string} id - ID de l'organisation
     * @returns {Promise}
     */
    get: async(id) => {
        const response = await axiosInstance.get(`/organizations/${id}`);
        return response.data;
    },

    /**
     * Crée une nouvelle organisation
     * @param {Object} data - Données de l'organisation
     * @returns {Promise}
     */
    create: async(data) => {
        const response = await axiosInstance.post("/organizations", data);
        return response.data;
    },

    /**
     * Met à jour une organisation (méthode PATCH)
     * @param {string} id - ID de l'organisation
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise}
     */
    update: async(id, data) => {
        const response = await axiosInstance.patch(`/organizations/${id}`, data);
        return response.data;
    },

    /**
     * Archive une organisation (soft delete)
     * @param {string} id - ID de l'organisation
     * @returns {Promise}
     */
    softDelete: async(id) => {
        const response = await axiosInstance.delete(`/organizations/${id}`);
        return response.data;
    },

    /**
     * Restaure une organisation archivée
     * @param {string} id - ID de l'organisation
     * @returns {Promise}
     */
    restore: async(id) => {
        const response = await axiosInstance.post(`/organizations/${id}/restore`);
        return response.data;
    },

    /**
     * Supprime définitivement une organisation
     * @param {string} id - ID de l'organisation
     * @returns {Promise}
     */
    hardDelete: async(id) => {
        const response = await axiosInstance.delete(`/organizations/${id}/hard`);
        return response.data;
    },

    /**
     * Vérifie la disponibilité d'un slug
     * @param {Object} params - Paramètres de requête (slug ou name)
     * @returns {Promise}
     */
    checkSlug: async(params) => {
        const response = await axiosInstance.get("/organizations/check-slug", { params });
        return response.data;
    },

    /**
     * Récupère les statistiques des organisations
     * @param {Object} params - Paramètres de requête
     * @returns {Promise}
     */
    getStats: async(params = {}) => {
        const response = await axiosInstance.get("/organizations/stats", { params });
        return response.data;
    },

    /**
     * Récupère les utilisateurs d'une organisation
     * @param {string} orgId - ID de l'organisation
     * @param {Object} params - Paramètres de requête (pagination, filtres)
     * @returns {Promise}
     */
    getUsersByOrg: async(orgId, params = {}) => {
        const response = await axiosInstance.get(`/organizations/${orgId}/users`, { params });
        return response.data;
    },

    /**
     * Récupère les départements d'une organisation
     * @param {string} orgId - ID de l'organisation
     * @param {Object} params - Paramètres de requête (pagination, filtres)
     * @returns {Promise}
     */
    getDepartmentsByOrg: async(orgId, params = {}) => {
        const response = await axiosInstance.get(`/organizations/${orgId}/departments`, { params });
        return response.data;
    },

    /**
     * Récupère les demandes d'une organisation
     * @param {string} orgId - ID de l'organisation
     * @param {Object} params - Paramètres de requête (pagination, filtres)
     * @returns {Promise}
     */
    getDemandesByOrg: async(orgId, params = {}) => {
        const response = await axiosInstance.get(`/organizations/${orgId}/demandes`, { params });
        return response.data;
    },
};

export default orgService;