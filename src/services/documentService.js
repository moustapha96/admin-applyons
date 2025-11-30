import axiosInstance from './api';

const documentService = {
    list: (params = {}) => axiosInstance.get('/documents', { params }),
    getById: (id) => axiosInstance.get(`/documents/${id}`),


    create: (formData) => axiosInstance.post(`/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),

    update: (id, data) => axiosInstance.put(`/documents/${id}`, data),

    remove: (id) => axiosInstance.delete(`/documents/${id}`),

    traduire: (id, { urlTraduit, encryptionKeyTraduit }) =>
        axiosInstance.post(`/documents/${id}/traduire`, { urlTraduit, encryptionKeyTraduit }),

    // <-- NOUVEAU: upload d'un PDF traduit sur le même document
    traduireUpload(id, formData) {
        return axiosInstance.post(`/documents/${id}/traduire-upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(r => r.data);
    },

    // Contenu (PDF/Blob)
    getContent: (id, { type = 'original', display = true } = {}) =>
        axiosInstance.get(`/documents/${id}/content`, {
            params: { type, display },
            responseType: 'blob',
        }),

    // Info & vérification
    getInfo: (id) => axiosInstance.get(`/documents/${id}/info`),
    verifyIntegrity: (id) => axiosInstance.get(`/documents/${id}/verify`),

    addTranslation: (documentId, formDataOrPayload) =>
        axiosInstance.patch(`/demandes/documents/${documentId}/translate`, formDataOrPayload).then(r => r.data),

    // Statut / assignation
    changeStatus: (id, status) => axiosInstance.patch(`/demandes/${id}/status`, { status }).then(r => r.data),

    // Documents
    listDocuments: (id) => axiosInstance.get(`/demandes/${id}/documents`).then(r => r.data),

    addDocument: (id, payload) => axiosInstance.post(`/demandes/${id}/documents`, payload).then(r => r.data),
    getDocumentInfo: (documentId) => axiosInstance.get(`/demandes/documents/${documentId}/info`).then(r => r.data),
    getDocumentContentUrl: (documentId, type = "original") => `/demandes/documents/${documentId}/content?type=${type}`,

    listByDemande: (demandeId, params = {}) =>
        axiosInstance.get(`/demandes/${demandeId}/documents`, { params }),

    uploadTranslated(documentId, file, extra = {}) {
        const fd = new FormData();
        fd.append("file", file);
        // facultatif si ton ctrl le souhaite :
        if (extra.ownerOrgId) fd.append("ownerOrgId", extra.ownerOrgId);
        if (extra.encryptionKeyTraduit) fd.append("encryptionKeyTraduit", extra.encryptionKeyTraduit);

        // endpoint que tu as configuré :
        const { data } = axiosInstance.post(`/documents/${documentId}/traduire-upload`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    deleteTranslation(documentId) {
        return axiosInstance.delete(`/documents/${documentId}/traduction`);
    },
};

export default documentService;