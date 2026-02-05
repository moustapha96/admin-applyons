/**
 * Validation des uploads de documents (PDF uniquement, max 5 Mo).
 * Ne pas utiliser pour les photos de profil / avatars.
 */

export const PDF_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const PDF_ACCEPT = ".pdf";
export const PDF_ACCEPT_MIME = "application/pdf";

/**
 * Vérifie qu'un fichier est un PDF et ne dépasse pas la taille max.
 * @param {File} file
 * @returns {{ valid: boolean, errorKey: string | null }} errorKey: 'pdfOnly' | 'maxSize' | null
 */
export function validatePdfFile(file) {
  if (!file) return { valid: false, errorKey: "pdfOnly" };

  const isPdf =
    file.type === PDF_ACCEPT_MIME ||
    (file.name && file.name.toLowerCase().endsWith(".pdf"));

  if (!isPdf) {
    return { valid: false, errorKey: "pdfOnly" };
  }

  if (file.size > PDF_MAX_SIZE_BYTES) {
    return { valid: false, errorKey: "maxSize" };
  }

  return { valid: true, errorKey: null };
}

/**
 * Crée une fonction beforeUpload pour Ant Design Upload (documents PDF, max 5 Mo).
 * À utiliser dans les pages d'upload de documents (pas pour les photos de profil).
 * @param {(msg: string) => void} messageError - ex: (msg) => message.error(msg)
 * @param {(key: string) => string} t - ex: (key) => t(key)
 * @param {typeof import('antd').Upload.LIST_IGNORE} listIgnore - Upload.LIST_IGNORE pour exclure le fichier de la liste
 * @returns {(file: File) => false | symbol} false = garder en liste (upload manuel), listIgnore = rejeter
 */
export function createPdfBeforeUpload(messageError, t, listIgnore) {
  const keyPrefix = "common.upload.";
  return (file) => {
    const { valid, errorKey } = validatePdfFile(file);
    if (!valid) {
      messageError(t(`${keyPrefix}${errorKey}`));
      return listIgnore;
    }
    return false; // ne pas envoyer automatiquement
  };
}
