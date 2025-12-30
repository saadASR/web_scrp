require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const scraperRoutes = require('./routes/scraper');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Logger middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', scraperRoutes);

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    logger.error('Erreur serveur:', err);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    logger.info(`Serveur démarré sur http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;