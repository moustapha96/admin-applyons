// import axios from "axios";

// const urlApi =
//     import.meta.env.VITE_API_URL;

// const axiosInstance = axios.create({
//     baseURL: urlApi,
//     withCredentials: true,
//     headers: { "Content-Type": "application/json", Accept: "application/json" },
//     timeout: 10000,
// });

// /** Routes publiques (pas d’Authorization) */
// const publicRoutes = [
//     "/auth/login",
//     "/auth/register",
//     "/auth/forgot-password",
//     "/auth/reset-password",
//     "/auth/refresh-token", // doit rester public pour le retry
// ];

// /** Injecte le Bearer token si non-public */
// axiosInstance.interceptors.request.use((config) => {
//     const isPublic = publicRoutes.some((r) => config.url.startsWith(r));
//     if (!isPublic) {
//         const token = localStorage.getItem("token");
//         if (token) config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });


// let isRefreshing = false;
// let pendingQueue = [];

// function processQueue(error, token = null) {
//     pendingQueue.forEach(({ resolve, reject }) => {
//         if (error) reject(error);
//         else resolve(token);
//     });
//     pendingQueue = [];
// }

// axiosInstance.interceptors.response.use(
//     (res) => res.data,
//     async(error) => {
//         const original = error.config;
//         const status = error.response.status;

//         // Pas de retry pour les appels refresh eux-mêmes
//         const isRefreshCall = original.url.startsWith("/auth/refresh-token");
//         const isPublic = publicRoutes.some((r) => original.url.startsWith(r));

//         if (status === 401 && !isPublic && !isRefreshCall) {
//             if (isRefreshing) {
//                 return new Promise((resolve, reject) => {
//                     pendingQueue.push({
//                         resolve: (token) => {
//                             if (token) original.headers.Authorization = `Bearer ${token}`;
//                             resolve(axiosInstance(original));
//                         },
//                         reject,
//                     });
//                 });
//             }

//             isRefreshing = true;
//             try {
//                 const refreshRes = await axiosInstance.post("/auth/refresh-token");
//                 const newToken = refreshRes.token || refreshRes.data.token;
//                 if (newToken) {
//                     localStorage.setItem("token", newToken);
//                     axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
//                 }
//                 processQueue(null, newToken);
//                 isRefreshing = false;

//                 // rejoue la requête d’origine
//                 if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
//                 return axiosInstance(original);
//             } catch (e) {
//                 processQueue(e, null);
//                 isRefreshing = false;

//                 // purge session + redirection
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("user");
//                 try {
//                     window.location.href = "/auth/login";
//                 } catch (e) { console.log(e); }
//                 return Promise.reject(error.response.data || error.message);
//             }
//         }

//         return Promise.reject(error.response.data || error.message);
//     }
// );

// export default axiosInstance;




import axios from "axios";

const urlApi =
    import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: urlApi,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 10000,
});

/** Routes publiques (pas d’Authorization) */
const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/create-with-organization",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token", // doit rester public pour le retry
    "/invites/token/", // route publique pour récupérer une invitation par token
    "/invites/accept/", // route publique pour accepter une invitation
];

/** Injecte le Bearer token si non-public */
axiosInstance.interceptors.request.use((config) => {
    const url = config.url || "";
    const isPublic = publicRoutes.some((r) => url.startsWith(r));

    if (!isPublic) {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// --------------------------------------------------
// Gestion du refresh token
// --------------------------------------------------
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    pendingQueue = [];
}

axiosInstance.interceptors.response.use(
    // SUCCESS -> on renvoie directement le data JSON
    (res) => res.data,
    // ERROR
    async(error) => {
        const original = error.config || {};
        const status = error.response?.status || 0;

        // Si pas de réponse HTTP (timeout, réseau, CORS...) on renvoie l'erreur brute
        if (!error.response) {
            return Promise.reject(error);
        }

        const url = original.url || "";

        // Pas de retry pour les appels refresh eux-mêmes
        const isRefreshCall = url.startsWith("/auth/refresh-token");
        const isPublic = publicRoutes.some((r) => url.startsWith(r));

        // ---------- Cas 401 sur une route PROTÉGÉE ----------
        if (status === 401 && !isPublic && !isRefreshCall) {
            // Evite les boucles infinies si le refresh renvoie lui-même 401
            if (original._retry) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                try {
                    const from = (typeof window !== "undefined" && window.location.pathname + window.location.search) || "";
                    const isAuthPage = from.startsWith("/auth");
                    const loginUrl = from && !isAuthPage
                        ? `/auth/login?redirect=${encodeURIComponent(from)}`
                        : "/auth/login";
                    window.location.href = loginUrl.startsWith("/") ? loginUrl : "/auth/login";
                } catch (e) {}
                return Promise.reject(error.response.data || error.message);
            }
            original._retry = true;

            // Si un refresh est déjà en cours -> on met la requête dans la queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token) => {
                            if (token) {
                                original.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(axiosInstance(original));
                        },
                        reject,
                    });
                });
            }

            // Sinon, on lance le refresh une seule fois
            isRefreshing = true;
            try {
                // ⚠️ ICI, refreshRes est déjà le JSON (data)
                const refreshRes = await axiosInstance.post("/auth/refresh-token");
                const newToken = refreshRes.token; // PAS refreshRes.data.token
                const newUser = refreshRes.user;

                const fromLocal = !!localStorage.getItem("token");
                if (newToken) {
                    if (fromLocal) {
                        localStorage.setItem("token", newToken);
                    } else {
                        sessionStorage.setItem("token", newToken);
                    }
                    axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                }
                if (newUser) {
                    if (fromLocal) {
                        localStorage.setItem("user", JSON.stringify(newUser));
                    } else {
                        sessionStorage.setItem("user", JSON.stringify(newUser));
                    }
                }

                processQueue(null, newToken);
                isRefreshing = false;

                // Rejoue la requête d’origine avec le nouveau token
                if (newToken) {
                    original.headers.Authorization = `Bearer ${newToken}`;
                }
                return axiosInstance(original);
            } catch (e) {
                processQueue(e, null);
                isRefreshing = false;

                // purge session + redirection (on garde l'URL pour rediriger après connexion)
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                try {
                    const from = (typeof window !== "undefined" && window.location.pathname + window.location.search) || "";
                    const isAuthPage = from.startsWith("/auth");
                    const loginUrl = from && !isAuthPage
                        ? `/auth/login?redirect=${encodeURIComponent(from)}`
                        : "/auth/login";
                    window.location.href = loginUrl.startsWith("/") ? loginUrl : "/auth/login";
                } catch (e2) {}

                return Promise.reject(e.response?.data || e.message);
            }
        }

        // Autres erreurs (403, 500, etc.)
        return Promise.reject(error.response?.data || error.message);
    }
);

export default axiosInstance;