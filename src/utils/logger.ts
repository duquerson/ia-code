import { LOG_CONFIG } from '../config.ts';

// Niveles de logging
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

// Colores para consola
const colors = {
    [LogLevel.ERROR]: '\x1b[31m', // Rojo
    [LogLevel.WARN]: '\x1b[33m',  // Amarillo
    [LogLevel.INFO]: '\x1b[36m',  // Cyan
    [LogLevel.DEBUG]: '\x1b[35m'  // Magenta
};

// Función para obtener nivel de logging desde configuración
const getLogLevel = (): LogLevel => {
    switch (LOG_CONFIG.level.toLowerCase()) {
        case 'error': return LogLevel.ERROR;
        case 'warn': return LogLevel.WARN;
        case 'info': return LogLevel.INFO;
        case 'debug': return LogLevel.DEBUG;
        default: return LogLevel.INFO;
    }
};

// Función para formatear mensaje de log
const formatMessage = (level: LogLevel, message: string, meta?: Record<string, unknown>): string => {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const color = colors[level];
    const resetColor = '\x1b[0m';

    let formattedMessage = `${color}[${timestamp}] ${levelName}${resetColor}: ${message}`;

    if (meta) {
        formattedMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return formattedMessage;
};

// Función principal de logging
const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    if (level > getLogLevel()) return;

    const formattedMessage = formatMessage(level, message, meta);

    if (LOG_CONFIG.enableConsole) {
        console.log(formattedMessage);
    }

    // Aquí se podría agregar logging a archivo en producción
    if (LOG_CONFIG.enableFile && LOG_CONFIG.level === 'production') {
        // Implementar logging a archivo si es necesario
    }
};

// Funciones específicas por nivel
export const logger = {
    error: (message: string, meta?: Record<string, unknown>) => log(LogLevel.ERROR, message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log(LogLevel.WARN, message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log(LogLevel.INFO, message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => log(LogLevel.DEBUG, message, meta),

    // Función para logging de operaciones HTTP
    http: (method: string, url: string, statusCode?: number, duration?: number) => {
        const message = `${method} ${url}`;
        const meta = {
            method,
            url,
            ...(statusCode && { statusCode }),
            ...(duration && { duration: `${duration}ms` })
        };

        if (statusCode && statusCode >= 400) {
            logger.error(message, meta);
        } else if (statusCode && statusCode >= 300) {
            logger.warn(message, meta);
        } else {
            logger.info(message, meta);
        }
    },

    // Función para logging de operaciones de base de datos
    database: (operation: string, collection: string, duration?: number, error?: Error) => {
        const message = `DB ${operation} en ${collection}`;
        const meta = {
            operation,
            collection,
            ...(duration && { duration: `${duration}ms` }),
            ...(error && { error: error.message })
        };

        if (error) {
            logger.error(message, meta);
        } else {
            logger.debug(message, meta);
        }
    }
};

export default logger;