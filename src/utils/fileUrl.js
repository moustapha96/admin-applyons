// src/utils/fileUrl.js
export function buildDownloadUrl(doc) {
    if (!doc ? .id) return null;
    // adapte selon ton stockage (S3, disque, proxy…)
    return `${process.env.PUBLIC_API_BASE_URL || ""}/api/documents/${doc.id}/download`;
}