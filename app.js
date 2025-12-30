require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const scraperRoutes = require('./routes/scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('[INFO]', `${req.method} ${req.path}`);
    next();
});


app.use('/api', scraperRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use((err, req, res, next) => {
    console.error('[ERROR]', err && err.message ? err.message : err);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? (err && err.message ? err.message : String(err)) : undefined
    });
});


app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});


app.listen(PORT, () => {
    console.log(`[INFO] Serveur démarré sur http://localhost:${PORT}`);
    console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;