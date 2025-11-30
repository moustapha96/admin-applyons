// src/services/transaction.service.js
import axiosInstance from "./api";

const transactionService = {
    list: (params) => axiosInstance.get("/transactions", { params }),
    getById: (id) => axiosInstance.get(`/transactions/${id}`),
    create: (payload) => axiosInstance.post("/transactions", payload),
    updateStatut: (id, statut) =>
        axiosInstance.patch(`/transactions/${id}/statut`, { statut }),
    archive: (id) => axiosInstance.delete(`/transactions/${id}`),
    restore: (id) => axiosInstance.patch(`/transactions/${id}/restore`),
    stats: (params) => axiosInstance.get("/transactions/stats", { params }),
};

export default transactionService;