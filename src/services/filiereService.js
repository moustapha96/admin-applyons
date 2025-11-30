import axiosInstance from './api';

const filiereService = {
    // Exemples côté contrôleur filière (list, getById, create, update, delete, listByOrganization, stats)
    list: (params = {}) => axiosInstance.get('/filieres', { params }),
    getById: (id) => axiosInstance.get(`/filieres/${id}`),
    create: (data) => axiosInstance.post('/filieres', data),
    update: (id, data) => axiosInstance.put(`/filieres/${id}`, data),
    remove: (id) => axiosInstance.delete(`/filieres/${id}`),

    // GET /filieres/by-organization?organizationId=...
    listByOrganization: (params = {}) => axiosInstance.get('/filieres/by-organization', { params }),

    // GET /filieres/stats
    stats: (params = {}) => axiosInstance.get('/filieres/stats', { params }),
};

export default filiereService;