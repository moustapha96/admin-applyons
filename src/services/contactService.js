import axiosInstance from "./api";

// Service pour les contacts
const contactService = {
    getAll: (params) => axiosInstance.get('/contacts', { params }),
    create: (data) => axiosInstance.post('/contacts', data),
    update: (id, data) => axiosInstance.put(`/contacts/${id}`, data),
    delete: (id) => axiosInstance.delete(`/contacts/${id}`),
    updateStatus: (id, status) => axiosInstance.patch(`/contacts/${id}/status`, { status }),
    respond: (id, message) => axiosInstance.put(`/contacts/${id}/respond`, { message }),
};

export default contactService;