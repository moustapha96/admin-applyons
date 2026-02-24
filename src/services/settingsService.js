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
};

export default settingsService;