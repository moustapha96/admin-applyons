import axiosInstance from './api';

const abonnementService = {
    list: (params = {}) => axiosInstance.get('/abonnements', { params }),

    getById: (id) => axiosInstance.get(`/abonnements/${id}`),

    create: (data) => axiosInstance.post('/abonnements', data),

    update: (id, data) => axiosInstance.put(`/abonnements/${id}`, data),
    // archive / restore / hard delete
    softDelete: (id) => axiosInstance.delete(`/abonnements/${id}`),

    restore: (id) => axiosInstance.patch(`/abonnements/${id}/restore`),

    hardDelete: (id) => axiosInstance.delete(`/abonnements/${id}/hard-delete`),
    // renew
    renew: (id, data) => axiosInstance.post(`/abonnements/${id}/renew`, data),
    // org active
    getActiveForOrg: (orgId) =>
        axiosInstance.get(`/abonnements/organisations/${orgId}/active`),
    // expiring soon
    expiringSoon: (params = {}) =>
        axiosInstance.get('/abonnements/expiring-soon', { params }),
    // stats
    stats: (params = {}) => axiosInstance.get('/abonnements/stats', { params }),
};

export default abonnementService;