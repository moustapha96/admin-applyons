import axiosInstance from './api';

const departmentService = {
    // GET /departments
    list: (params = {}) => axiosInstance.get('/departments', { params }),

    // GET /departments/:id
    getById: (id) => axiosInstance.get(`/departments/${id}`),

    // POST /departments
    create: (data) => axiosInstance.post('/departments', data),

    // PUT /departments/:id
    update: (id, data) => axiosInstance.put(`/departments/${id}`, data),

    // DELETE /departments/:id
    remove: (id) => axiosInstance.delete(`/departments/${id}`),

    // GET /departments/:id/filieres
    listFilieres: (id, params = {}) => axiosInstance.get(`/departments/${id}/filieres`, { params }),

    // POST /departments/:id/filieres
    createFiliere: (id, data) => axiosInstance.post(`/departments/${id}/filieres`, data),

    // GET /departments/export/csv  (blob)
    exportCsv: (params = {}) =>
        axiosInstance.get('/departments/export/csv', { params, responseType: 'blob' }),

    // GET /departments/stats
    stats: () => axiosInstance.get('/departments/stats'),
};

export default departmentService;