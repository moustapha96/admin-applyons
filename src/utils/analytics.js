/**
 * Google Analytics 4 (GA4) - Utilitaire d'intégration
 * Utilise l'ID de mesure (format G-XXXXXXXXXX) via VITE_GA_MEASUREMENT_ID
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const isEnabled = Boolean(MEASUREMENT_ID && MEASUREMENT_ID.startsWith("G-"));

/**
 * Charge le script gtag et initialise GA4
 */
export function initGA() {
  if (!isEnabled) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    send_page_view: false, // on envoie les page_view nous-mêmes pour le SPA
    anonymize_ip: true,
  });
}

/**
 * Envoie une page view à GA4
 * @param {string} path - Chemin de la page (ex: /demandeur/demandes)
 * @param {string} [title] - Titre optionnel de la page
 */
export function pageview(path, title) {
  if (!isEnabled || typeof window.gtag !== "function") return;

  window.gtag("config", MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Envoie un événement personnalisé à GA4
 * @param {string} eventName - Nom de l'événement (ex: 'conversion', 'click_download')
 * @param {Record<string, unknown>} [params] - Paramètres optionnels
 */
export function trackEvent(eventName, params = {}) {
  if (!isEnabled || typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params);
}

export { isEnabled as isAnalyticsEnabled, MEASUREMENT_ID };
