/**
 * Mixpanel - Intégration selon la doc officielle
 * https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript
 *
 * - Script loader dans index.html (avant </head>)
 * - init() appelé au démarrage avec les options recommandées
 * - identify() au login, reset() au logout
 */

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || "949513406c6dd8c7110dae723dd0f674";
const isEnabled = Boolean(MIXPANEL_TOKEN);

/**
 * Initialise Mixpanel (à appeler au démarrage de l'app).
 * Configuration recommandée pour SPA + Session Replay + Heatmaps.
 */
export function initMixpanel() {
  if (!isEnabled || typeof window.mixpanel === "undefined") return;

  window.mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    track_pageview: "full-url", // SPA: track path, query string et hash
    record_sessions_percent: 100,
    record_heatmap_data: true,
  });
}

/**
 * Identifie l'utilisateur (à appeler après login).
 * @param {string} distinctId - ID utilisateur (ex: user.id)
 * @param {Record<string, unknown>} [properties] - Propriétés pour people.set (email, name, etc.)
 */
export function mixpanelIdentify(distinctId, properties = {}) {
  if (!isEnabled || typeof window.mixpanel?.identify !== "function") return;

  window.mixpanel.identify(distinctId);
  if (Object.keys(properties).length > 0 && window.mixpanel.people?.set) {
    window.mixpanel.people.set(properties);
  }
}

/**
 * Réinitialise Mixpanel (à appeler au logout).
 * Génère un nouveau distinct_id et nettoie cookie/storage.
 */
export function mixpanelReset() {
  if (!isEnabled || typeof window.mixpanel?.reset !== "function") return;
  window.mixpanel.reset();
}

/**
 * Envoie un événement personnalisé.
 * @param {string} eventName - Nom de l'événement
 * @param {Record<string, unknown>} [properties] - Propriétés optionnelles
 */
export function mixpanelTrack(eventName, properties = {}) {
  if (!isEnabled || typeof window.mixpanel?.track !== "function") return;
  window.mixpanel.track(eventName, properties);
}

/**
 * Envoie une page view manuelle (optionnel si track_pageview: "full-url" est utilisé).
 * @param {Record<string, string>} [props] - Ex: { page: "/pricing", title: "Pricing" }
 */
export function mixpanelTrackPageview(props = {}) {
  if (!isEnabled || typeof window.mixpanel?.track_pageview !== "function") return;
  window.mixpanel.track_pageview(props);
}

export { isEnabled as isMixpanelEnabled, MIXPANEL_TOKEN };
