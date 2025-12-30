const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

/**
 * Service de scraping web
 */
const scrapingService = {
    /**
     * Scrape une URL et extrait les données
     * @param {string} url - URL à scraper
     * @returns {Object} Données extraites
     */
    async scrape(url) {
        try {
            // Configuration axios
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: parseInt(process.env.SCRAPE_TIMEOUT) || 10000,
                maxRedirects: 5,
                maxContentLength: 10 * 1024 * 1024, // 10MB max
                validateStatus: (status) => status < 500 // Accepter les codes < 500
            });

            // Vérifier le statut
            if (response.status === 404) {
                throw new Error('404: Page non trouvée');
            }
            if (response.status === 403) {
                throw new Error('403: Accès refusé');
            }
            if (response.status >= 400) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            // Parser le HTML
            const $ = cheerio.load(response.data);

            // Extraire les données
            const data = {
                url,
                scrapedAt: new Date().toISOString(),
                title: this.extractTitle($),
                meta: this.extractMeta($),
                headings: this.extractHeadings($),
                paragraphs: this.extractParagraphs($),
                links: this.extractLinks($, url),
                images: this.extractImages($, url),
                stats: {}
            };

            // Calculer les statistiques
            data.stats = {
                totalHeadings: data.headings.length,
                totalParagraphs: data.paragraphs.length,
                totalLinks: data.links.length,
                totalImages: data.images.length,
                wordCount: this.countWords(data.paragraphs)
            };

            return data;

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('timeout: Délai d\'attente dépassé');
            }
            if (error.code === 'ENOTFOUND') {
                throw new Error('DNS: Domaine introuvable');
            }
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Connexion refusée par le serveur');
            }
            
            logger.error('Erreur de scraping:', error.message);
            throw error;
        }
    },

    /**
     * Extraire le titre de la page
     */
    extractTitle($) {
        return $('title').text().trim() || 
               $('h1').first().text().trim() || 
               'Sans titre';
    },

    /**
     * Extraire les métadonnées
     */
    extractMeta($) {
        return {
            description: $('meta[name="description"]').attr('content') || '',
            keywords: $('meta[name="keywords"]').attr('content') || '',
            author: $('meta[name="author"]').attr('content') || '',
            ogTitle: $('meta[property="og:title"]').attr('content') || '',
            ogDescription: $('meta[property="og:description"]').attr('content') || '',
            ogImage: $('meta[property="og:image"]').attr('content') || ''
        };
    },

    /**
     * Extraire les titres (h1-h6)
     */
    extractHeadings($) {
        const headings = [];
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            $(tag).each((i, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 0) {
                    headings.push({
                        level: tag,
                        text: text
                    });
                }
            });
        });
        return headings;
    },

    /**
     * Extraire les paragraphes
     */
    extractParagraphs($) {
        const paragraphs = [];
        $('p').each((i, el) => {
            let text = $(el).text().trim();
            // Normaliser les espaces
            text = text.replace(/\s+/g, ' ');
            // Filtrer les paragraphes trop courts
            if (text && text.length > 20) {
                paragraphs.push(text);
            }
        });
        return paragraphs;
    },

    /**
     * Extraire les liens
     */
    extractLinks($, baseUrl) {
        const links = [];
        const seen = new Set();

        $('a').each((i, el) => {
            let href = $(el).attr('href');
            if (!href) return;

            // Convertir les URLs relatives en absolues
            try {
                if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                    href = new URL(href, baseUrl).href;
                }
            } catch (e) {
                return;
            }

            // Filtrer les liens valides
            if (href.startsWith('http') && !seen.has(href)) {
                seen.add(href);
                links.push({
                    url: href,
                    text: $(el).text().trim() || 'Sans texte'
                });
            }
        });

        return links;
    },

    /**
     * Extraire les images
     */
    extractImages($, baseUrl) {
        const images = [];
        const seen = new Set();

        $('img').each((i, el) => {
            let src = $(el).attr('src');
            if (!src) return;

            // Convertir les URLs relatives en absolues
            try {
                if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
                    src = new URL(src, baseUrl).href;
                }
            } catch (e) {
                return;
            }

            if (!seen.has(src)) {
                seen.add(src);
                images.push({
                    src: src,
                    alt: $(el).attr('alt') || '',
                    title: $(el).attr('title') || ''
                });
            }
        });

        return images;
    },

    /**
     * Compter les mots dans les paragraphes
     */
    countWords(paragraphs) {
        return paragraphs.reduce((count, p) => {
            return count + p.split(/\s+/).length;
        }, 0);
    }
};

module.exports = scrapingService;