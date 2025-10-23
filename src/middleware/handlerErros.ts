import { Elysia } from 'elysia';
import { ValidationError, NotFoundError, ServerError } from '../utils/errors.ts';

//--------------------------------------------------------------------------
// Middleware Global de Errores - Capa transversal
// Responsabilidades:
// - Capturar y manejar todos los errores de la aplicación
// - Log estructurado de errores para debugging
// - Transformar errores internos en respuestas HTTP consistentes
// - No generar errores (solo manejarlos)
//--------------------------------------------------------------------------

// Sistema de logging simple sin dependencias adicionales
const logger = {
    error: (message: string, meta?: unknown) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${message}`, meta ? JSON.stringify(meta) : '');
    }
};

export const onErrors = new Elysia()
    .onError(({ error, set, code }) => {
        // Log del error para debugging
        logger.error('Error en la aplicación:', {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            code: code || 'UNKNOWN'
        });

        // Errores de aplicación personalizados
        if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ServerError) {
            set.status = error.status;
            return {
                success: false,
                error: error.code,
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }

        // Errores de validación de Mongoose
        if (error instanceof Error && error.name === 'ValidationError') {
            set.status = 400;
            return {
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Los datos proporcionados no son válidos',
                details: error.message,
                timestamp: new Date().toISOString()
            };
        }

        // Errores de CastError de Mongoose (ID inválido)
        if (error instanceof Error && error.name === 'CastError') {
            set.status = 400;
            return {
                success: false,
                error: 'INVALID_ID',
                message: 'ID de tarea inválido',
                timestamp: new Date().toISOString()
            };
        }

        // Errores nativos de Elysia (validación y parsing)
        if (code === 'VALIDATION' || code === 'PARSE') {
            set.status = 400;
            return {
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Los datos proporcionados no son válidos',
                timestamp: new Date().toISOString()
            };
        }

        // Error interno del servidor (fallback)
        set.status = 500;
        return {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error interno del servidor',
            timestamp: new Date().toISOString()
        };
    });