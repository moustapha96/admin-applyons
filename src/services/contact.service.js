import axiosInstance from './api';

const contactService = {
    // GET /contact-messages
    list: (params = {}) => axiosInstance.get('/contact-messages', { params }),

    // GET /contact-messages/:id
    getById: (id) => axiosInstance.get(`/contact-messages/${id}`),

    // POST /contact-messages  (public)
    create: (data) => axiosInstance.post('/contact-messages', data),

    // DELETE /contact-messages/:id
    remove: (id) => axiosInstance.delete(`/contact-messages/${id}`),

    // DELETE /contact-messages?days=30  (purge)
    purgeOlderThan: (days = 30) =>
        axiosInstance.delete('/contact-messages', { params: { days } }),

    // GET /contact-messages/export/csv  (blob)
    exportCsv: (params = {}) =>
        axiosInstance.get('/contact-messages/export/csv', { params, responseType: 'blob' }),

    // GET /contact-messages/stats
    stats: () => axiosInstance.get('/contact-messages/stats'),
};

export default contactService;