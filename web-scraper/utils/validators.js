const { URL } = require('url');

/**
 * Valider et sécuriser une URL
 * @param {string} urlString - URL à valider
 * @returns {Object} Résultat de la validation
 */
function validateUrl(urlString) {
    try {
        // Vérifier que l'URL n'est pas vide
        if (!urlString || typeof urlString !== 'string') {
            return {
                isValid: false,
                error: 'URL vide ou invalide'
            };
        }

        // Parser l'URL
        const url = new URL(urlString);

        // Vérifier le protocole
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return {
                isValid: false,
                error: 'Seuls les protocoles HTTP et HTTPS sont autorisés'
            };
        }

        // Vérifier que ce n'est pas une URL locale (protection SSRF)
        const hostname = url.hostname.toLowerCase();
        const forbiddenHosts = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1',
            '[::1]'
        ];

        if (forbiddenHosts.includes(hostname)) {
            return {
                isValid: false,
                error: 'Les URLs locales ne sont pas autorisées'
            };
        }

        // Vérifier les plages IP privées
        if (isPrivateIP(hostname)) {
            return {
                isValid: false,
                error: 'Les adresses IP privées ne sont pas autorisées'
            };
        }

        // Vérifier les domaines .local
        if (hostname.endsWith('.local')) {
            return {
                isValid: false,
                error: 'Les domaines .local ne sont pas autorisés'
            };
        }

        // Vérifier la longueur de l'URL
        if (urlString.length > 2048) {
            return {
                isValid: false,
                error: 'URL trop longue (max 2048 caractères)'
            };
        }

        return {
            isValid: true,
            url: url.href
        };

    } catch (error) {
        return {
            isValid: false,
            error: 'Format d\'URL invalide'
        };
    }
}

/**
 * Vérifier si une adresse IP est privée
 * @param {string} hostname - Nom d'hôte ou IP
 * @returns {boolean}
 */
function isPrivateIP(hostname) {
    // Vérifier si c'est une adresse IP
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!ipv4Regex.test(hostname)) {
        return false;
    }

    const parts = hostname.split('.').map(Number);

    // Vérifier les plages privées
    // 10.0.0.0/8
    if (parts[0] === 10) {
        return true;
    }

    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
        return true;
    }

    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) {
        return true;
    }

    // 169.254.0.0/16 (APIPA)
    if (parts[0] === 169 && parts[1] === 254) {
        return true;
    }

    return false;
}

/**
 * Sanitize une chaîne de caractères
 * @param {string} str - Chaîne à nettoyer
 * @returns {string}
 */
function sanitizeString(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }

    return str
        .trim()
        .replace(/[<>]/g, '') // Enlever < et >
        .substring(0, 1000); // Limiter la longueur
}

module.exports = {
    validateUrl,
    isPrivateIP,
    sanitizeString
};