import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, pageview } from "../utils/analytics";
import { initMixpanel, mixpanelPageView } from "../utils/mixpanel";

/**
 * Composant invisible qui initialise les analytics (GA4 + Mixpanel)
 * et envoie une page view à chaque changement de route (SPA).
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initGA();
    initMixpanel();
  }, []);

  useEffect(() => {
    const path = location.pathname + location.search;
    const title = document.title;
    pageview(path, title);
    mixpanelPageView(path, title);
  }, [location.pathname, location.search]);

  return null;
}
