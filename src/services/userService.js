// // src/services/user.service.js
import axiosInstance from "./api";
import organizationService from "./organizationService";
const userService = {
    list: (params) => axiosInstance.get("/users", { params }),

    getById: (id) => axiosInstance.get(`/users/${id}`),

    create: (payload) => axiosInstance.post("/users", payload ,
    {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    update: (id, payload) => axiosInstance.put(`/users/${id}`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    archive: (id) => axiosInstance.delete(`/users/${id}`),

    restore: (id) => axiosInstance.patch(`/users/${id}/restore`),

    resetPassword: (id) => axiosInstance.patch(`/users/${id}/password`),

    updatePermissions: (id, permissions) =>
        axiosInstance.patch(`/users/${id}/permissions`, { permissions }),
    search: (q, limit = 10) =>
        axiosInstance.get("/users/search", { params: { q, limit } }),

    usersByOrg: (orgId, params = {}) => organizationService.listUsers(orgId, params),

    sendMailToUser: (body) => axiosInstance.post('/users/send-mail', body),

};
export default userService;