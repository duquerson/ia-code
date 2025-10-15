import mongoose from 'mongoose';
import { MONGODB_URI } from '../config.ts';
import logger from '../utils/logger.js';

let isConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 5;

// Función mejorada de conexión con reintentos
export const connectDB = async (retryCount = 0): Promise<void> => {
    if (isConnected) {
        logger.debug('Ya existe una conexión activa a MongoDB');
        return;
    }

    try {
        // MONGODB_URI ya está validada en config.ts
        connectionAttempts = retryCount + 1;
        logger.info(`Intento de conexión ${connectionAttempts}/${maxConnectionAttempts}`, {
            attempt: connectionAttempts,
            maxAttempts: maxConnectionAttempts
        });

        // ✅ Configurar opciones de conexión según documentación oficial de Mongoose 8+
        const options = {
            // Gestión de conexiones (opciones estándar y compatibles)
            maxPoolSize: 10,                    // Máximo 10 conexiones en pool

            // Timeouts básicos
            serverSelectionTimeoutMS: 5000,    // 5s para seleccionar servidor

            // Comportamiento estándar
            bufferCommands: false,             // No bufferizar comandos

            // Opciones básicas de Mongoose
            retryWrites: true,                 // Reintentar writes automáticamente
            retryReads: true,                  // Reintentar reads automáticamente
        };

        await mongoose.connect(MONGODB_URI, options);

        // ✅ REMOVED: Verificación de ping problemática
        // La conexión ya está verificada por el mongoose.connect exitoso
        isConnected = true;

        // ✅ Logging usando el sistema de logging en lugar de console.log
        logger.info('MongoDB conectado exitosamente', {
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            readyState: mongoose.connection.readyState
        });

    } catch (error) {
        logger.error(`Error conectando a MongoDB (intento ${connectionAttempts})`, {
            error: error instanceof Error ? error.message : error,
            attempt: connectionAttempts,
            maxAttempts: maxConnectionAttempts
        });

        if (retryCount < maxConnectionAttempts - 1) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Backoff exponencial
            logger.warn(`Reintentando conexión en ${delay / 1000} segundos`, {
                nextAttempt: retryCount + 2,
                delayMs: delay
            });
            setTimeout(() => connectDB(retryCount + 1), delay);
        } else {
            logger.error('No se pudo conectar a MongoDB después de varios intentos', {
                maxAttempts: maxConnectionAttempts,
                mongodbUri: MONGODB_URI ? 'Configurada' : 'No configurada'
            });
            logger.error('Verifica:', {
                mongodbUri: 'URI de conexión a MongoDB',
                network: 'Conectividad de red',
                server: 'Estado del servidor MongoDB'
            });
            throw error;
        }
    }
};

// Función para desconectar
export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        isConnected = false;
        logger.info('Desconectado de MongoDB exitosamente');
    } catch (error) {
        logger.error('Error desconectando de MongoDB', {
            error: error instanceof Error ? error.message : error
        });
        throw error;
    }
};

// Función para verificar estado de conexión
export const getConnectionStatus = () => {
    const status = {
        isConnected,
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        attempts: connectionAttempts
    };

    logger.debug('Estado de conexión solicitado', status);
    return status;
};

