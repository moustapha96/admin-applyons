import axiosInstance from './api';

const organizationService = {
    // GET /organizations
    list: (params = {}) => axiosInstance.get('/organizations', { params }),

    // GET /organizations/check-slug?slug=...&name=...
    checkSlug: (params = {}) => axiosInstance.get('/organizations/check-slug', { params }),

    // GET /organizations/stats
    stats: (params = {}) => axiosInstance.get('/organizations/stats', { params }),

    // GET /organizations/:id
    getById: (id) => axiosInstance.get(`/organizations/${id}`),

    // POST /organizations
    create: (data) => axiosInstance.post('/organizations', data),

    // PATCH /organizations/:id
    update: (id, data) => axiosInstance.patch(`/organizations/${id}`, data),

    // DELETE /organizations/:id  (soft delete)
    softDelete: (id) => axiosInstance.delete(`/organizations/${id}`),

    // POST /organizations/:id/restore
    restore: (id) => axiosInstance.post(`/organizations/${id}/restore`),

    // DELETE /organizations/:id/hard  (hard delete)
    hardDelete: (id) => axiosInstance.delete(`/organizations/${id}/hard`),

    // GET /organizations/:id/users
    listUsers: (id, params = {}) => axiosInstance.get(`/organizations/${id}/users`, { params }),

    // GET /organizations/:id/departments
    listDepartments: (id, params = {}) => axiosInstance.get(`/organizations/${id}/departments`, { params }),

    listDemandes: (id, params = {}) => axiosInstance.get(`/organizations/${id}/demandes`, { params }),
};

export default organizationService;