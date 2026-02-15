import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, pageview } from "../utils/analytics";
import { initMixpanel } from "../utils/mixpanel";

/**
 * Composant invisible qui initialise les analytics (GA4 + Mixpanel).
 * GA4 : page view manuelle à chaque route (SPA).
 * Mixpanel : track_pageview "full-url" gère automatiquement les changements d’URL (SPA).
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initGA();
    initMixpanel();
  }, []);

  useEffect(() => {
    pageview(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
}
