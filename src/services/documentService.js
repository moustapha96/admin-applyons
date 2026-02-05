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
    getContent: async function getContent(id, { type = 'original', display = true, retries = 0 } = {}) {
        // Le backend peut utiliser "traduit" ou "translated" selon la version
        // Essayer d'abord avec le type fourni, puis avec les alternatives
        let normalizedType = type;
        
        // Normaliser les variantes
        if (type === 'translated') {
            normalizedType = 'traduit';
        } else if (type === 'traduit') {
            normalizedType = 'traduit';
        }
        
        try {
            return await axiosInstance.get(`/documents/${id}/content`, {
                params: { type: normalizedType, display },
                responseType: 'blob',
            });
        } catch (error) {
            // Si 404 avec "traduit", essayer avec "translated" (fallback)
            if (error.response?.status === 404 && normalizedType === 'traduit') {
                try {
                    return await axiosInstance.get(`/documents/${id}/content`, {
                        params: { type: 'translated', display },
                        responseType: 'blob',
                    });
                } catch (fallbackError) {
                    // Si toujours 404 et qu'on n'a pas encore fait de retry, attendre un peu et réessayer
                    if (retries < 2) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
                        return this.getContent(id, { type, display, retries: retries + 1 });
                    }
                    // Si toujours 404 après retries, le fichier n'existe vraiment pas
                    const errorMessage = fallbackError?.response?.data?.message || 
                                       error?.response?.data?.message || 
                                       'Document traduit non disponible. Le fichier peut ne pas être encore prêt après l\'upload.';
                    const enhancedError = new Error(errorMessage);
                    enhancedError.response = fallbackError?.response || error?.response;
                    throw enhancedError;
                }
            }
            throw error;
        }
    },

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
    // Obtenir l'URL d'affichage d'un document (utilise l'endpoint /content avec auth)
    getDocumentContentUrl: (documentId, type = "original", display = true) => {
        // Retourne le chemin relatif pour l'endpoint /content
        // Cet endpoint nécessite authentification et sera appelé via axiosInstance
        return `/documents/${documentId}/content?type=${type}&display=${display}`;
    },

    // Télécharger un document
    downloadDocument: async (documentId, type = "original", filename = null) => {
        try {
            // getContent retourne déjà le blob (via l'interceptor qui retourne res.data)
            const blob = await documentService.getContent(documentId, { type, display: false });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `document_${documentId}_${type}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            // Gérer les erreurs d'authentification
            if (error.response?.status === 401) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            } else if (error.response?.status === 403) {
                throw new Error('Vous n\'avez pas accès à ce document.');
            }
            throw error;
        }
    },

    listByDemande: (demandeId, params = {}) =>
        axiosInstance.get(`/demandes/${demandeId}/documents`, { params }),

    uploadTranslated(documentId, file, extra = {}) {
        const fd = new FormData();
        fd.append("file", file);
        if (extra.ownerOrgId) fd.append("ownerOrgId", extra.ownerOrgId);
        if (extra.encryptionKeyTraduit) fd.append("encryptionKeyTraduit", extra.encryptionKeyTraduit);

        return axiosInstance
            .post(`/documents/${documentId}/traduire-upload`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data);
    },

    deleteTranslation(documentId) {
        return axiosInstance.delete(`/documents/${documentId}/traduction`);
    },
};

export default documentService;