/**
 * Mixpanel - Initialisation et suivi
 * Token via VITE_MIXPANEL_TOKEN (fallback: token fourni par défaut)
 */

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || "949513406c6dd8c7110dae723dd0f674";
const isEnabled = Boolean(MIXPANEL_TOKEN);

/**
 * Initialise Mixpanel (à appeler au démarrage de l'app).
 * Le script Mixpanel est chargé dans index.html ; ici on appelle init.
 */
export function initMixpanel() {
  if (!isEnabled || typeof window.mixpanel === "undefined") return;

  window.mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
  });
}

/**
 * Envoie une page view à Mixpanel (pour le suivi SPA)
 * @param {string} path - Chemin de la page
 * @param {string} [title] - Titre optionnel
 */
export function mixpanelPageView(path, title) {
  if (!isEnabled || typeof window.mixpanel?.track !== "function") return;

  window.mixpanel.track_pageview({ page: path, title: title || document.title });
}

/**
 * Envoie un événement personnalisé à Mixpanel
 * @param {string} eventName - Nom de l'événement
 * @param {Record<string, unknown>} [properties] - Propriétés optionnelles
 */
export function mixpanelTrack(eventName, properties = {}) {
  if (!isEnabled || typeof window.mixpanel?.track !== "function") return;

  window.mixpanel.track(eventName, properties);
}

/**
 * Identifie l'utilisateur (à appeler après login)
 * @param {string} distinctId - ID utilisateur (ex: user.id)
 * @param {Record<string, unknown>} [properties] - Propriétés utilisateur
 */
export function mixpanelIdentify(distinctId, properties = {}) {
  if (!isEnabled || typeof window.mixpanel?.identify !== "function") return;

  window.mixpanel.identify(distinctId);
  if (Object.keys(properties).length > 0 && window.mixpanel.people?.set) {
    window.mixpanel.people.set(properties);
  }
}

export { isEnabled as isMixpanelEnabled, MIXPANEL_TOKEN };
