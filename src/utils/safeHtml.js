// src/utils/safeHtml.ts
import DOMPurify from "dompurify";

/** Optionnel : durcis un peu la config */
DOMPurify.setConfig({
  USE_PROFILES: { html: true }, // (html | svg | mathML)
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
});

/** Optionnel : protége les liens sortants */
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if ("target" in (node )) {
    const el = node ;
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  }
});

/** Sanitize et renvoie un objet utilisable par dangerouslySetInnerHTML */
export function toSafeInnerHTML(rawHtml) {
  const str = typeof rawHtml === "string" ? rawHtml : "";
  const clean = DOMPurify.sanitize(str);
  return { __html: clean };
}

/** Si tu veux juste la string nettoyée */
export function sanitizeHtml(rawHtml) {
  const str = typeof rawHtml === "string" ? rawHtml : "";
  return DOMPurify.sanitize(str);
}
