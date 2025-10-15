/**
 * Manejador Global de Errores
 * 
 * Este middleware intercepta TODOS los errores de la aplicación
 * y devuelve respuestas HTTP consistentes y bien formateadas
 */

import type { Elysia } from 'elysia';
import { 
    AppError, 
    ValidationError, 
    NotFoundError, 
    InvalidIdError, 
    DatabaseError,
    DuplicateError 
} from '../utils/errors.ts';
import logger from '../utils/logger.ts';

/**
 * Configura el manejador global de errores para Elysia
 * 
 * @param app - Instancia de Elysia
 * @returns Instancia de Elysia con el manejador configurado
 */
export const setupErrorHandler = (app: Elysia) => {
    return app.onError(({ code, error, set, request }) => {
        const method = request.method;
        const url = new URL(request.url).pathname;

        // ═══════════════════════════════════════════════════════
        // CASO 1: Errores personalizados de nuestra aplicación
        // ═══════════════════════════════════════════════════════
        if (error instanceof AppError) {
            logger.warn(`${error.constructor.name}: ${error.message}`, {
                code: error.code,
                statusCode: error.statusCode,
                method,
                url
            });

            set.status = error.statusCode;
            return {
                error: error.code,
                message: error.message,
                ...(error instanceof ValidationError && error.details && { details: error.details }),
                timestamp: new Date().toISOString(),
                path: url,
                method
            };
        }

        // ═══════════════════════════════════════════════════════
        // CASO 2: Errores de validación de Elysia
        // ═══════════════════════════════════════════════════════
        if (code === 'VALIDATION') {
            logger.warn('Error de validación de Elysia', {
                method,
                url,
                error: error instanceof Error ? error.message : error
            });

            set.status = 400;
            return {
                error: 'VALIDATION_ERROR',
                message: 'Los datos proporcionados no son válidos',
                details: error instanceof Error ? error.message : 'Error de validación',
                timestamp: new Date().toISOString(),
                path: url,
                method
            };
        }

        // ═══════════════════════════════════════════════════════
        // CASO 3: Rutas no encontradas (404)
        // ═══════════════════════════════════════════════════════
        if (code === 'NOT_FOUND') {
            logger.warn('Ruta no encontrada', { method, url });

            set.status = 404;
            return {
                error: 'NOT_FOUND',
                message: 'La ruta solicitada no existe',
                path: url,
                method,
                timestamp: new Date().toISOString(),
                suggestion: 'Verifica la documentación de la API'
            };
        }

        // ═══════════════════════════════════════════════════════
        // CASO 4: Errores inesperados (500)
        // ═══════════════════════════════════════════════════════
        logger.error('Error inesperado', {
            code,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            method,
            url
        });

        set.status = 500;
        return {
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado en el servidor',
            timestamp: new Date().toISOString(),
            path: url,
            method,
            // Solo mostrar detalles en desarrollo
            ...(process.env.NODE_ENV === 'development' && {
                details: error instanceof Error ? error.message : 'Error desconocido',
                stack: error instanceof Error ? error.stack : undefined
            })
        };
    });
};
