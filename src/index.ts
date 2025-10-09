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
import { connectDB } from './config/db.ts'

/**
 * Configuración de la aplicación Elysia con adaptador Node.js
 * Permite ejecutar la aplicación en un servidor HTTP estándar
 */
const app = new Elysia({ adapter: node() })

// Configuración de CORS
app.use(cors())

// Manejo global de errores
app.onError(({ code, error, set }) => {
    console.error('Error capturado:', { code, error });
    
    if (code === 'VALIDATION' || code === 'NOT_FOUND') {
        set.status = 404
        return {
            error: 'Not Found',
            message: 'The requested route does not exist'
        }
    }

    set.status = 500
    return {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
    }
})

// Registro de rutas
app.use(testRoutes)

// Catch-all para rutas no definidas
app.all('*', ({ set }) => {
    set.status = 404
    return {
        error: 'Not Found',
        message: 'The requested route does not exist'
    }
})
// Inicializar conexión a base de datos e iniciar servidor
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, ({ hostname, port }: server) =>
            console.log(`Server running at http://${hostname}:${port}`)
        );
    } catch (error) {
        console.error('Error iniciando servidor:', error);
        process.exit(1);
    }
};

startServer();