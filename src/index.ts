/**
 * API REST para gestión de notas de prueba
 *
 * Esta aplicación proporciona endpoints CRUD básicos para manejar notas de prueba
 * utilizando el framework Elysia.js con TypeScript.
 *
 * Características principales:
 * - Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
 * - Validación de tipos con Elysia
 * - Manejo de errores HTTP estándar
 * - Datos mock para desarrollo y testing
 */

import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { PORT } from '../config.js';
import type { server } from './types/index.js';

import { cors } from '@elysiajs/cors';
import { testRoutes } from './routes/test.routes.js';
/**
 * Configuración de la aplicación Elysia con adaptador Node.js
 * Permite ejecutar la aplicación en un servidor HTTP estándar
 */
const app = new Elysia({ adapter: node() });

app.use(testRoutes);
app.onError(({ code, error, set }) => {
    // Errores de validación
    if (code === 'VALIDATION') {
        set.status = 400;
        return {
            error: 'Bad Request',
            message: 'Invalid data provided',
            details: error instanceof Error ? error.message : 'Validation failed'
        };
    }

    // Ruta no encontrada
    if (code === 'NOT_FOUND') {
        set.status = 404;
        return {
            error: 'Not Found',
            message: 'The requested resource does not exist'
        };
    }

    // Otros errores
    set.status = 500;
    return {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
})

app.all('*', ({ set, request }) => {
    set.status = 400;
    return {
        error: 'Bad Request',
        message: `Route ${request.url} not found`
    };
})
app.use(cors()).listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))