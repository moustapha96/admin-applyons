import axiosInstance from './api';

const demandeService = {
    // GET /demandes
    list: (params = {}) => axiosInstance.get('/demandes', { params }),

    listATraiter: (assignedOrgId, params = {}) => axiosInstance.get(`/demandes/to-treat/${assignedOrgId}`, { params }),

    // GET /demandes/:id
    getById: (id) => axiosInstance.get(`/demandes/${id}`),

    // GET /demandes/by-code/:code (minimal info pour ajout document)
    getByCode: (code) => axiosInstance.get(`/demandes/by-code/${encodeURIComponent(code)}`),

    // POST /demandes
    // Accepte soit un objet JSON classique, soit un FormData (pour upload de passeport, etc.)
    create: (data) => {
        if (typeof FormData !== "undefined" && data instanceof FormData) {
            return axiosInstance.post('/demandes', data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }
        return axiosInstance.post('/demandes', data);
    },

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
    },

    // GET /demandes/invitees/:inviteeOrgId
    listInviteesByOrgId: (inviteeOrgId, params = {}) =>
        axiosInstance.get(`/demandes/invitees/${inviteeOrgId}`, { params }),

    // DELETE /demandes/invitees/:inviteeOrgId/:demandeCode
    // Supprime l'invitation (DemandePartageInvitee) pour une demande spécifique
    deleteInviteeByDemandeCode: (inviteeOrgId, demandeCode) =>
        axiosInstance.delete(`/demandes/invitees/${inviteeOrgId}/${encodeURIComponent(demandeCode)}`),
};

export default demandeService;