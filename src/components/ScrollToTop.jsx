"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** À chaque changement de route, remonte en haut de la page (viewport). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
