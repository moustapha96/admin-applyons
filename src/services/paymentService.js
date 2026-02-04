/* eslint-disable no-unused-vars */
// src/services/payment.service.js
import axiosInstance from "./api";
import { loadStripe } from "@stripe/stripe-js";


const urlApi =
    import.meta.env.VITE_API_URL;
const STRIPE_PUBLIC_KEY = "pk_test_51Q3Lo4JKwZ36wwZjsfyDN25sYUpD8PdUVHWYnryUCISxNjVZzVlqbmg6F3fi8PXGMOXajbDu8O1Gg48BGjJxT1FA0048V89piE";


const PAYPAL_SECRET = "AWUFH6_SN-v1cQIy2WbxjZXqs3NJHPNSBJb_TEpjjQ4JZlKZu-KlTYZpJiWMrPiVGGKVfvhA6XQvKjGt";
// const PAYPAL_ID = "EPVrbMrGtXwKqa_ap6p633vcPzdFbattFojhr_XEPQkO0T9mS_ozWklaRB5Yl_xn-KUaK6Adksw1BOCE";

// const PAYPAL_SECRET = "AWUFH6_SN-v1cQIy2WbxjZXqs3NJHPNSBJb_TEpjjQ4JZlKZu-KlTYZpJiWMrPiVGGKVfvhA6XQvKjGt";
const PAYPAL_ID = "EPVrbMrGtXwKqa_ap6p633vcPzdFbattFojhr_XEPQkO0T9mS_ozWklaRB5Yl_xn-KUaK6Adksw1BOCE";

const paypal_id = "ATY_tA1zy-K2HMNBRpuMcP1zH3QwR8-TC0M2_lywc9wN7ozwyuBiNQgMxNsA4_kecVYReedEmj8ToyhV"


export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const getPayPalConfig = () => {
    return {
        "client-id": paypal_id,
        currency: "USD",
        intent: "capture",
    };
};



const paymentService = {
    list: (params) => axiosInstance.get("/payments", { params }),

    getById: (id) => axiosInstance.get(`/payments/${id}`),

    create: (payload) => axiosInstance.post("/payments", payload),

    update: (id, payload) => axiosInstance.put(`/payments/${id}`, payload),
    updateStatus: (id, status, providerRef) =>
        axiosInstance.patch(`/payments/${id}/status`, { status, providerRef }),
    stats: (params) => axiosInstance.get("/payments/stats", { params }),

    getForDemande: async(demandeId) =>
        (await axiosInstance.get(`/payments/demande/${demandeId}`)),

    // STRIPE
    createStripeIntent: async({ demandeId, amount, currency = "USD" }) => {
        const { data } = await axiosInstance.post(`/payments/stripe/create-intent`, { demandeId, amount, currency });
        return data; // { clientSecret, publishableKey, paymentIntentId }
    },
    confirmStripe: async({ demandeId, paymentIntentId }) => {
        const { data } = await axiosInstance.post(`/payments/stripe/confirm`, { demandeId, paymentIntentId });
        return data;
    },

    // PAYPAL
    createPaypalOrder: async({ demandeurId, amount, currency = "USD" }) => {
        const { data } = await axiosInstance.post(`/payments/paypal/create-order`, { demandeurId, amount, currency });
        return data; // { orderID }
    },
    capturePaypalOrder: async({ demandeId, orderID }) => {
        const { data } = await axiosInstance.post(`/payments/paypal/capture`, { demandeId, orderID });
        return data;
    },

    getQuote: async(demandeId) =>
        (await axiosInstance.get(`/payments/${demandeId}/quote`)),

    createPaymentIntentInstitut: async({ institutId, amount, currency = "USD" }) => {
        const data = await axiosInstance.post(`/payments/stripe/create-intent-institut`, { institutId, amount, currency });
        return data; // { clientSecret, publishableKey, paymentIntentId }
    },

    createPaymentIntentInstitutPaypal: async({ institutId }) => {
        const data = await axiosInstance.post(`/payments/paypal/create-intent-institut`, { institutId });
        return data; // { clientSecret, publishableKey, paymentIntentId }
    },


    createPaymentIntentDemandeur: async({ demandeurId, amount, currency = "USD" }) => {
        const res = await axiosInstance.post(`/payments/stripe/create-intent-demandeur`, { demandeurId, amount, currency });
        console.log(res)
        return res; // { clientSecret, publishableKey, paymentIntentId }
    },

    getPayPalConfig: async() => {
        const res = await axiosInstance.get(`/payments/paypal/config`);
        return res; // { clientId, currency, intent }
    },

    getPublishableKey: async() => {
        const res = await axiosInstance.get(`/payments/stripe/publishable-key`);
        return res; // { publishable_key }
    },

    getPriceAbonnementInstitut: async(idOrg) => {
        const res = await axiosInstance.get(`/payments/${idOrg}/get-price-institut`);
        return res; // { publishable_key }
    },
    getPriceDemandeDemandeur: async() => {
        const res = await axiosInstance.get(`/payments/get-price-demandeur`);
        return res; // { publishable_key }
    },

    // Demandes d'authentification (paiement par le demandeur)
    getForDemandeAuthentification: (demandeAuthId) =>
        axiosInstance.get(`/payments/demande-authentification/${demandeAuthId}`),
    getQuoteDemandeAuthentification: (demandeAuthId) =>
        axiosInstance.get(`/payments/demande-authentification/${demandeAuthId}/quote`),
    getQuoteDemandeAuthNew: () =>
        axiosInstance.get(`/payments/quote-demande-auth`),
    createStripeIntentDemandeAuth: (payload) =>
        axiosInstance.post(`/payments/stripe/create-intent-demande-auth`, payload),
    confirmStripeDemandeAuth: (payload) =>
        axiosInstance.post(`/payments/stripe/confirm-demande-auth`, payload),
    createPaypalOrderDemandeAuth: (payload) =>
        axiosInstance.post(`/payments/paypal/create-order-demande-auth`, payload),
    capturePaypalOrderDemandeAuth: (payload) =>
        axiosInstance.post(`/payments/paypal/capture-demande-auth`, payload),

};

export default paymentService;