import { config } from 'dotenv';

// Configurar variables de entorno
config({ path: './config.env', quiet: true });

// Función para validar configuración requerida
const validateConfig = () => {
    const errors: string[] = [];

    if (!process.env.PORT) {
        console.warn('⚠️ PORT no definida, usando valor por defecto: 4321');
    }

    if (!process.env.MONGODB_URI) {
        errors.push('MONGODB_URI es requerida pero no está definida');
    }

    if (errors.length > 0) {
        const errorMessage = `Errores de configuración:\n${errors.map(err => `  - ${err}`).join('\n')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
    }
};

// Función para validar puerto
const validatePort = (port: number): boolean => {
    return port > 0 && port < 65536;
};

// Función para validar URI de MongoDB
const validateMongoURI = (uri: string): boolean => {
    if (!uri) return false;
    const mongoUriRegex = /^mongodb(\+srv)?:\/\/[^\s]+$/;
    return mongoUriRegex.test(uri);
};

// Validar configuración al cargar
try {
    validateConfig();
} catch (error) {
    console.error('💥 Error crítico de configuración:', error);
    process.exit(1);
}

// Configuración validada y segura
export const PORT = (() => {
    const port = Number(process.env.PORT) || 4321;
    if (!validatePort(port)) {
        throw new Error(`Puerto inválido: ${port}. Debe estar entre 1 y 65535`);
    }
    return port;
})();

export const MONGODB_URI = (() => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI es requerida');
    }
    if (!validateMongoURI(uri)) {
        throw new Error('MONGODB_URI tiene un formato inválido');
    }
    return uri;
})();

// Configuración adicional con valores por defecto seguros
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Configuración de logging basada en entorno
export const LOG_CONFIG = {
    level: LOG_LEVEL,
    enableConsole: NODE_ENV !== 'test',
    enableFile: NODE_ENV === 'production',
    logDir: process.env.LOG_DIR || './logs'
};

// Configuración de seguridad
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
export const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000; // 15 minutos
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100; // 100 requests por ventana

console.log('🔧 Configuración cargada:');
console.log(`   Puerto: ${PORT}`);
console.log(`   Entorno: ${NODE_ENV}`);
console.log(`   Nivel de log: ${LOG_LEVEL}`);
console.log(`   MongoDB URI: ${MONGODB_URI ? 'Configurada' : 'No configurada'}`);