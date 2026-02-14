import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, pageview } from "../utils/analytics";

/**
 * Composant invisible qui initialise Google Analytics et envoie
 * une page view à chaque changement de route (SPA).
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    pageview(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
}
