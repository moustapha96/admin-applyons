const API_URL = import.meta.env.VITE_API_URL || '';

const getBackendBaseUrl = () => {
  if (!API_URL) return '';

  return API_URL;
};

/**
 * Construit l'URL complète d'une image à partir du backend + chemin renvoyé par l'API.
 * - Si `path` est déjà une URL absolue (http, https, //, data:), on la retourne telle quelle.
 * - Sinon on préfixe avec l'URL du backend.
 */
export const buildImageUrl = (path) => {
  if (!path) return '';
  
  // Si c'est déjà une URL absolue, on la retourne telle quelle
  if (/^(https?:\/\/|data:|blob:|\/\/)/i.test(path)) {
    return path;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL_SIMPLE || 'https://back.applyons.com';
 
  return `${baseUrl}${path}`;

 };

