/**
 * API REST para gestión de notas
 * 
 * Esta aplicación proporciona endpoints CRUD básicos para manejar notas
 * utilizando el framework Elysia.js con TypeScript y MongoDB.
 * 
 * Características principales:
 * - Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
 * - Validación de tipos con Elysia
 * - Manejo de errores HTTP estándar
 * - Persistencia de datos con MongoDB Atlas
 */

import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { PORT } from './config.ts'
import type { server } from './types/index.ts'
import { testRoutes } from './routes/test.routes.ts'
import logger from './utils/logger.ts'

import { connectDB } from './config/db.ts'
/**
 * Configuración de la aplicación Elysia con adaptador Node.js
 * Permite ejecutar la aplicación en un servidor HTTP estándar
 */
const app = new Elysia({ adapter: node() })

// Configuración de CORS
app.use(cors())

// Manejo global de errores mejorado según prácticas oficiales de Elysia.js
app.onError(({ code, error, set, request }) => {
    const method = request.method;
    const url = new URL(request.url).pathname;

    // Log del error usando nuestro sistema de logging
    logger.error(`Error en ${method} ${url}`, {
        code,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        method,
        url
    });

    // Manejo específico de errores de validación
    if (code === 'VALIDATION') {
        set.status = 400;
        return {
            error: 'Validation Error',
            message: 'Los datos proporcionados no son válidos',
            details: error instanceof Error ? error.message : 'Error de validación desconocido',
            timestamp: new Date().toISOString(),
            path: url,
            method
        };
    }

    // Manejo de rutas no encontradas
    if (code === 'NOT_FOUND') {
        set.status = 404;
        return {
            error: 'Not Found',
            message: 'La ruta solicitada no existe',
            path: url,
            method,
            timestamp: new Date().toISOString(),
            suggestion: 'Verifica la documentación de la API en /api/test'
        };
    }

    // Manejo específico de errores lanzados desde las rutas
    if (error instanceof Error) {
        const errorMessage = error.message;

        // Errores de validación de datos
        if (errorMessage.startsWith('VALIDATION_ERROR:')) {
            set.status = 400;
            return {
                error: 'Validation Error',
                message: 'Los datos proporcionados no son válidos',
                details: errorMessage.replace('VALIDATION_ERROR:', '').trim(),
                timestamp: new Date().toISOString(),
                path: url,
                method
            };
        }

        // Errores de ID inválido
        if (errorMessage.startsWith('INVALID_ID:')) {
            set.status = 400;
            return {
                error: 'Invalid ID',
                message: 'El ID proporcionado no es válido',
                details: errorMessage.replace('INVALID_ID:', '').trim(),
                timestamp: new Date().toISOString(),
                path: url,
                method
            };
        }

        // Errores de duplicados
        if (errorMessage.startsWith('DUPLICATE_ERROR:')) {
            set.status = 409;
            return {
                error: 'Duplicate Error',
                message: 'Ya existe un registro con estos datos',
                details: errorMessage.replace('DUPLICATE_ERROR:', '').trim(),
                timestamp: new Date().toISOString(),
                path: url,
                method
            };
        }

        // Errores de base de datos
        if (errorMessage.startsWith('DATABASE_ERROR:')) {
            set.status = 500;
            return {
                error: 'Database Error',
                message: 'Error interno de la base de datos',
                details: process.env.NODE_ENV === 'development' ?
                    errorMessage.replace('DATABASE_ERROR:', '').trim() : undefined,
                timestamp: new Date().toISOString(),
                path: url,
                method
            };
        }
    }

    // Error interno del servidor (fallback)
    set.status = 500;
    return {
        error: 'Internal Server Error',
        message: 'Ha ocurrido un error inesperado en el servidor',
        timestamp: new Date().toISOString(),
        path: url,
        method,
        ...(process.env.NODE_ENV === 'development' && {
            details: error instanceof Error ? error.message : 'Error desconocido',
            stack: error instanceof Error ? error.stack : undefined
        })
    };
});

// Registro de rutas
app.use(testRoutes)

// Catch-all para rutas no definidas mejorado
app.all('*', ({ set, request }) => {
    const method = request.method;
    const url = new URL(request.url).pathname;

    logger.warn(`Ruta no encontrada: ${method} ${url}`, {
        method,
        url,
        userAgent: request.headers.get('user-agent')
    });

    set.status = 404;
    return {
        error: 'Not Found',
        message: 'La ruta solicitada no existe',
        path: url,
        method,
        timestamp: new Date().toISOString(),
        suggestion: 'Verifica la documentación de la API en /api/test'
    };
});
// Función mejorada para iniciar servidor con manejo robusto de errores
const startServer = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos

    try {
        logger.info('Intentando conectar a la base de datos...', { attempt: retryCount + 1 });
        await connectDB();

        logger.info('Iniciando servidor...', { port: PORT });
        app.listen(PORT, ({ hostname, port }: server) => {
            logger.info('Servidor iniciado exitosamente', {
                url: `http://${hostname}:${port}`,
                environment: process.env.NODE_ENV || 'development'
            });
        });

    } catch (error) {
        logger.error(`Error iniciando servidor (intento ${retryCount + 1}/${maxRetries + 1})`, {
            error: error instanceof Error ? error.message : error,
            attempt: retryCount + 1
        });

        if (retryCount < maxRetries) {
            logger.info(`Reintentando en ${retryDelay / 1000} segundos...`, { nextAttempt: retryCount + 2 });
            setTimeout(() => startServer(retryCount + 1), retryDelay);
        } else {
            logger.error('No se pudo iniciar el servidor después de varios intentos', {
                maxRetries,
                port: PORT,
                mongodbUri: process.env.MONGODB_URI ? 'Configurada' : 'No configurada'
            });
            logger.error('Verifica:', {
                envFile: 'Variables de entorno (.env)',
                mongodb: 'Conexión a MongoDB',
                port: 'Puerto disponible'
            });
            process.exit(1);
        }
    }
};

startServer();
