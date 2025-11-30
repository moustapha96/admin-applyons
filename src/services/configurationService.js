import axiosInstance from './api';

const configurationService = {
    // GET /configurations  (list)


    async list(params = {}) {
        const { search, prefix, page = 1, limit = 50 } = params;
        const { data } = await axiosInstance.get("/configurations", {
            params: { search, prefix, page, limit },
        });
        // le contrôleur renvoie { configurations: [...] }
        return data || [];
    },
    // POST /configurations  (upsert)
    upsert: (data) => axiosInstance.post('/configurations', data),
};

export default configurationService;