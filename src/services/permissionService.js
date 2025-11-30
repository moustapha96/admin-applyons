import axiosInstance from './api';

const permissionService = {
    // GET /permissions
    list: (params = {}) => axiosInstance.get('/permissions', { params }),

    // POST /permissions
    create: (data) => axiosInstance.post('/permissions', data),

    // PUT /permissions/:id
    update: (id, data) => axiosInstance.put(`/permissions/${id}`, data),

    // DELETE /permissions/:id
    remove: (id) => axiosInstance.delete(`/permissions/${id}`),
};

export default permissionService;