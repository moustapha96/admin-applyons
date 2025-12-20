import axiosInstance from './api';

const apiRouteService = {
    // GET /api/api-routes
    list: (params = {}) => axiosInstance.get('/api-routes', { params }),

    // GET /api/api-routes/:id
    getById: (id) => axiosInstance.get(`/api-routes/${id}`),

    // GET /api/api-routes/stats
    stats: () => axiosInstance.get('/api-routes/stats'),

    // GET /api/api-routes/search?q=users
    search: (params = {}) => axiosInstance.get('/api-routes/search', { params }),

    // POST /api/api-routes/sync
    sync: () => axiosInstance.post('/api-routes/sync'),

    // PATCH /api/api-routes/:id
    update: (id, data) => axiosInstance.patch(`/api-routes/${id}`, data),
};

export default apiRouteService;
