const winston = require('winston');
const path = require('path');

// Format personnalisé
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        if (stack) {
            return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
        }
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

// Configuration du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // Console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),
        // Fichier pour les erreurs
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Fichier pour tous les logs
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    exitOnError: false
});

// En production, ne pas logger en console
if (process.env.NODE_ENV === 'production') {
    logger.remove(winston.transports.Console);
}

module.exports = logger;