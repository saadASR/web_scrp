const scrapingService = require('../services/scrapingService');
const { validateUrl } = require('../utils/validators');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');

// Cache avec TTL de 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Contrôleur principal pour le scraping
 */
const scraperController = {
    /**
     * Scrape une URL
     */
    async scrapeUrl(req, res) {
        try {
            const { url } = req.body;

            // Validation
            if (!url) {
                return res.status(400).json({ 
                    error: 'URL manquante',
                    details: 'Veuillez fournir une URL à scraper'
                });
            }

            const validation = validateUrl(url);
            if (!validation.isValid) {
                return res.status(400).json({ 
                    error: 'URL invalide',
                    details: validation.error
                });
            }

            // Vérifier le cache
            const cachedData = cache.get(url);
            if (cachedData) {
                logger.info(`Cache hit pour: ${url}`);
                return res.json({ 
                    ...cachedData, 
                    fromCache: true,
                    cachedAt: cachedData.scrapedAt
                });
            }

            // Scraper l'URL
            logger.info(`Début du scraping: ${url}`);
            const result = await scrapingService.scrape(url);

            // Mettre en cache
            cache.set(url, result);
            logger.info(`Scraping réussi: ${url}`);

            res.json({ ...result, fromCache: false });

        } catch (error) {
            logger.error('Erreur dans scraperController:', error);

            // Gestion des différents types d'erreurs
            if (error.message.includes('timeout')) {
                return res.status(408).json({ 
                    error: 'Timeout',
                    details: 'La page met trop de temps à répondre'
                });
            }

            if (error.message.includes('404')) {
                return res.status(404).json({ 
                    error: 'Page non trouvée',
                    details: 'La page demandée n\'existe pas'
                });
            }

            if (error.message.includes('403')) {
                return res.status(403).json({ 
                    error: 'Accès refusé',
                    details: 'Le site bloque l\'accès au scraping'
                });
            }

            res.status(500).json({ 
                error: 'Erreur lors du scraping',
                details: 'Impossible de scraper cette URL. Vérifiez qu\'elle est accessible.'
            });
        }
    },

    /**
     * Obtenir les statistiques du cache
     */
    getCacheStats(req, res) {
        const stats = cache.getStats();
        res.json({
            keys: cache.keys().length,
            hits: stats.hits,
            misses: stats.misses,
            ksize: stats.ksize,
            vsize: stats.vsize
        });
    },

    /**
     * Vider le cache
     */
    clearCache(req, res) {
        cache.flushAll();
        logger.info('Cache vidé');
        res.json({ message: 'Cache vidé avec succès' });
    }
};

module.exports = scraperController;