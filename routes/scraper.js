const express = require('express');
const rateLimit = require('express-rate-limit');
const scraperController = require('../controllers/scraperController');

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Max 20 requêtes
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
router.post('/scrape', limiter, scraperController.scrapeUrl);
router.get('/cache/stats', scraperController.getCacheStats);
router.delete('/cache/clear', scraperController.clearCache);

module.exports = router;