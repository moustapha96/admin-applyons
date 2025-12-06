/**
 * Utilitaires pour gérer les documents avec compatibilité
 * entre l'ancienne structure (urlOriginal, urlTraduit) 
 * et la nouvelle structure (original, traduit)
 */

/**
 * Vérifie si un document a une traduction disponible
 * @param {Object} doc - Le document
 * @returns {boolean}
 */
export const hasTranslation = (doc) => {
    if (!doc) return false;
    
    // Nouvelle structure
    if (doc.traduit && doc.traduit.hasFile) return true;
    
    // Ancienne structure (compatibilité)
    if (doc.estTraduit && (doc.urlTraduit || doc.urlChiffreTraduit)) return true;
    
    return false;
};

/**
 * Vérifie si un document a un original disponible
 * @param {Object} doc - Le document
 * @returns {boolean}
 */
export const hasOriginal = (doc) => {
    if (!doc) return false;
    
    // Nouvelle structure
    if (doc.original && doc.original.hasFile) return true;
    
    // Ancienne structure (compatibilité)
    if (doc.urlOriginal || doc.urlChiffre) return true;
    
    return false;
};

/**
 * Obtient l'URL de l'original (pour compatibilité, mais on utilise maintenant getContent)
 * @param {Object} doc - Le document
 * @returns {string|null}
 */
export const getOriginalUrl = (doc) => {
    if (!doc) return null;
    
    // Nouvelle structure
    if (doc.original?.url) return doc.original.url;
    if (doc.original?.urlChiffre) return doc.original.urlChiffre;
    
    // Ancienne structure (compatibilité)
    if (doc.urlOriginal) return doc.urlOriginal;
    if (doc.urlChiffre) return doc.urlChiffre;
    
    return null;
};

/**
 * Obtient l'URL de la traduction (pour compatibilité, mais on utilise maintenant getContent)
 * @param {Object} doc - Le document
 * @returns {string|null}
 */
export const getTranslatedUrl = (doc) => {
    if (!doc) return null;
    
    // Nouvelle structure
    if (doc.traduit?.url) return doc.traduit.url;
    if (doc.traduit?.urlChiffre) return doc.traduit.urlChiffre;
    
    // Ancienne structure (compatibilité)
    if (doc.urlTraduit) return doc.urlTraduit;
    if (doc.urlChiffreTraduit) return doc.urlChiffreTraduit;
    
    return null;
};

/**
 * Obtient l'URL de contenu pour l'affichage (utilise les contentUrls du backend si disponibles)
 * @param {Object} doc - Le document
 * @param {string} type - "original" ou "traduit"
 * @returns {string|null}
 */
export const getContentUrl = (doc, type = "original") => {
    if (!doc) return null;
    
    if (type === "traduit" || type === "translated") {
        // Nouvelle structure
        if (doc.traduit?.contentUrls?.view) return doc.traduit.contentUrls.view;
        if (doc.traduit?.contentUrls?.download) return doc.traduit.contentUrls.download;
        
        // Ancienne structure (compatibilité)
        if (doc.urlTraduit) return doc.urlTraduit;
        if (doc.urlChiffreTraduit) return doc.urlChiffreTraduit;
    } else {
        // Nouvelle structure
        if (doc.original?.contentUrls?.view) return doc.original.contentUrls.view;
        if (doc.original?.contentUrls?.download) return doc.original.contentUrls.download;
        
        // Ancienne structure (compatibilité)
        if (doc.urlOriginal) return doc.urlOriginal;
        if (doc.urlChiffre) return doc.urlChiffre;
    }
    
    return null;
};

/**
 * Normalise un document pour utiliser la nouvelle structure
 * @param {Object} doc - Le document
 * @returns {Object} Document normalisé
 */
export const normalizeDocument = (doc) => {
    if (!doc) return null;
    
    // Si le document a déjà la nouvelle structure, on le retourne tel quel
    if (doc.original || doc.traduit) {
        return doc;
    }
    
    // Sinon, on crée une structure compatible
    return {
        ...doc,
        original: {
            hasFile: !!(doc.urlOriginal || doc.urlChiffre),
            hasEncrypted: !!doc.urlChiffre,
            isEncrypted: !!doc.urlChiffre,
            url: doc.urlOriginal || null,
            urlChiffre: doc.urlChiffre || null,
            encryptionKey: doc.encryptionKey || null,
            blockchainHash: doc.blockchainHash || null,
            encryptedAt: doc.encryptedAt || null,
        },
        traduit: doc.estTraduit ? {
            hasFile: !!(doc.urlTraduit || doc.urlChiffreTraduit),
            hasEncrypted: !!doc.urlChiffreTraduit,
            isEncrypted: !!doc.urlChiffreTraduit,
            url: doc.urlTraduit || null,
            urlChiffre: doc.urlChiffreTraduit || null,
            encryptionKey: doc.encryptionKeyTraduit || null,
            blockchainHash: doc.blockchainHashTraduit || null,
            encryptedAt: doc.encryptedAtTraduit || null,
        } : null,
    };
};

