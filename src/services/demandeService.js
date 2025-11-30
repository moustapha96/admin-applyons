import axiosInstance from './api';

const demandeService = {
    // GET /demandes
    list: (params = {}) => axiosInstance.get('/demandes', { params }),

    listATraiter: (assignedOrgId, params = {}) => axiosInstance.get(`/demandes/to-treat/${assignedOrgId}`, { params }),

    // GET /demandes/:id
    getById: (id) => axiosInstance.get(`/demandes/${id}`),

    // POST /demandes
    create: (data) => axiosInstance.post('/demandes', data),

    // PUT /demandes/:id
    update: (id, data) => axiosInstance.put(`/demandes/${id}`, data),

    // PATCH /demandes/:id/status
    changeStatus: (id, status) => axiosInstance.patch(`/demandes/${id}/status`, { status }),

    assignOrg: (id, assignedOrgId) =>
        axiosInstance.patch(`/demandes/${id}/assign`, { assignedOrgId }),

    softDelete: (id) => axiosInstance.delete(`/demandes/${id}`),

    hardDelete: (id) => axiosInstance.delete(`/demandes/${id}/hard-delete`),

    listDocuments: (id) => axiosInstance.get(`/demandes/${id}/documents`),

    addDocument: (id, data) => axiosInstance.post(`/demandes/${id}/documents`, data),

    // GET /demandes/documents/:documentId/info
    getDocumentInfo: (documentId) =>
        axiosInstance.get(`/demandes/documents/${documentId}/info`),

    // GET /demandes/documents/:documentId/content?type=original|traduit  (blob PDF)
    getDocumentContent: (documentId, type = 'original') =>
        axiosInstance.get(`/demandes/documents/${documentId}/content`, {
            params: { type },
            responseType: 'blob',
        }),

    createPayment: (id, data) => axiosInstance.post(`/demandes/${id}/payments`, data),

    // PATCH /demandes/:demandeId/payments
    updatePaymentStatus: (demandeId, data) =>
        axiosInstance.patch(`/demandes/${demandeId}/payments`, data),

    // GET /demandes/stats
    stats: (params = {}) => axiosInstance.get('/demandes/stats', { params }),

    getDeamndeDemandeur(idUser, params = {}) {
        return axiosInstance.get(`/demandes/user/${idUser}`, { params });
    },

    getDemandeurOrganisation(idOrg, params = {}) {
        return axiosInstance.get(`/demandes/organisations/${idOrg}`, { params });
    },
    getDemandesDemandeur(idUser, assignedOrgId, params = {}) {
        return axiosInstance.get(`/demandes/users/${idUser}/organizations/${assignedOrgId}`, { params });
    },

    getDemandesDemandeurSimple(idUser, params = {}) {
        return axiosInstance.get(`/demandes/users/${idUser}`, { params });
    }
};

export default demandeService;