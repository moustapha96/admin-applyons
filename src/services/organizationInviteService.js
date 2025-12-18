import axiosInstance from './api';

const organizationInviteService = {
    // GET /api/invites/token/:token
    // Récupère les informations de l'invitation par token (public)
    getInviteByToken: (token) => 
        axiosInstance.get(`/invites/token/${token}`),

    // POST /api/invites/accept/:token
    // Accepte l'invitation et crée l'organisation + utilisateur (public)
    acceptInvite: (token, data) => 
        axiosInstance.post(`/invites/accept/${token}`, data),

    // GET /api/invites
    // Liste les invitations d'organisations (pour l'organisation connectée)
    list: (params = {}) => 
        axiosInstance.get('/invites', { params }),

    // POST /api/invites/invite-organization
    // Crée une invitation d'organisation (réservé aux INSTITUT)
    create: (data) => 
        axiosInstance.post('/invites/invite-organization', data),

    // DELETE /api/invites/:id
    // Supprime une invitation d'organisation
    delete: (id) => 
        axiosInstance.delete(`/invites/${id}`),
};

export default organizationInviteService;
