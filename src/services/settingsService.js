import axiosInstance from "./api";

// Service pour les paramètres du site
export const settingsService = {
    getAll: () => axiosInstance.get('/settings'),
    update: (formData) => axiosInstance.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAudits: (params) => axiosInstance.get('/settings/audit-logs', { params }),
    getPaymentSettings: () => axiosInstance.get('/settings/payment-settings'),
    updatePaymentSettings: (data) => axiosInstance.put('/settings/payment-settings', data),
    updateTeamMembers: (data) => axiosInstance.put('/settings/team', data),
    uploadTeamMemberImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return axiosInstance.post('/settings/team/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    // Contenus des pages du frontend
    getPageContentList: () => axiosInstance.get('/settings/page-content'),
    getPageContent: (pageKey) => axiosInstance.get(`/settings/page-content/${pageKey}`),
    updatePageContent: (pageKey, content) => axiosInstance.put(`/settings/page-content/${pageKey}`, { content }),
    uploadPageContentImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return axiosInstance.post('/settings/page-content/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default settingsService;