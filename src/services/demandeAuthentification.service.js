import axiosInstance from "./api";

const base = "/demandes-authentification";

/** Extrait le chemin relatif à l'API pour un urlOriginal (ex: .../api/documents/file/xxx => documents/file/xxx) */
function getDocumentFilePath(urlOriginal) {
  if (!urlOriginal || typeof urlOriginal !== "string") return null;
  const match = urlOriginal.match(/\/api\/documents\/file\/(.+)$/) || urlOriginal.match(/documents\/file\/(.+)$/);
  return match ? `documents/file/${match[1]}` : null;
}

/**
 * Récupère le fichier PDF avec le token (évite NO_TOKEN en ouvrant le lien directement).
 * Retourne un Blob à ouvrir via URL.createObjectURL.
 */
async function getDocumentFileBlob(urlOriginal) {
  const path = getDocumentFilePath(urlOriginal);
  if (!path) throw new Error("URL document invalide");
  const res = await axiosInstance.get(path, { responseType: "blob" });
  return res?.data ?? res;
}

const demandeAuthentificationService = {
  list: (params = {}) => axiosInstance.get(base, { params }),
  listAttributed: (params = {}) => axiosInstance.get(`${base}/attributed`, { params }),
  listAll: (params = {}) => axiosInstance.get(`${base}/all`, { params }),
  getById: (id) => axiosInstance.get(`${base}/${id}`),
  getByCode: (codeADN) => axiosInstance.get(`${base}/by-code/${encodeURIComponent(codeADN)}`),
  create: (data) => axiosInstance.post(base, data),
  notifyInstituts: (id, organizationIds) =>
    axiosInstance.post(`${base}/${id}/notify-instituts`, { organizationIds }),
  addDocumentByCode: (codeADN, formData) =>
    axiosInstance.post(`${base}/by-code/${encodeURIComponent(codeADN)}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateStatus: (id, data) => axiosInstance.patch(`${base}/${id}/status`, data),
  getDocumentFileBlob,
};

export default demandeAuthentificationService;
