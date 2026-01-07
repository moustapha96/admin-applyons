import axiosInstance from "./api";

const authService = {

    createWithOrganization:
        (payload) => axiosInstance.post("/auth/create-with-organization", payload),

    register: (payload) => axiosInstance.post("/auth/register", payload),
    login: (payload) => axiosInstance.post("/auth/login", payload),
    logout: () => axiosInstance.post("/auth/logout"),
    logoutAll: () => axiosInstance.post("/auth/logout-all"),

    getProfile: () => axiosInstance.get("/auth/profile"),
    updateProfile: (payload) => axiosInstance.put("/auth/profile", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }),
    changePassword: (payload) => axiosInstance.post("/auth/change-password", payload),

    forgotPassword: (email) => axiosInstance.post("/auth/forgot-password", { email }),
    resetPassword: (payload) => axiosInstance.post("/auth/reset-password", payload),

    resendActivation: (email) => axiosInstance.post("/auth/resend-activation", { email }),

    verifyAccount: (token) => axiosInstance.post("/auth/verify-account", { token }),

    refreshToken: () => axiosInstance.post("/auth/refresh-token"),

    // Admin-only
    adminSetEnabled: (userId, enabled) =>
        axiosInstance.post("/auth/admin/set-enabled", { userId, enabled }),
    impersonate: (targetUserId) =>
        axiosInstance.post("/auth/admin/impersonate", { targetUserId }),
    adminDeleteUser: (userId) =>
        axiosInstance.delete("/auth/admin/delete-user", { data: { userId } }),
};

export default authService;