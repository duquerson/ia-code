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
import { cors } from '@elysiajs/cors'
import { PORT } from '../config.js'
import type { server } from './types/index.js'
import { testRoutes } from './routes/test.routes.js'

/**
 * Configuración de la aplicación Elysia con adaptador Node.js
 * Permite ejecutar la aplicación en un servidor HTTP estándar
 */
const app = new Elysia({ adapter: node() })

// Configuración de CORS
app.use(cors())

// Manejo global de errores
app.onError(({ code, set }) => {
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
        message: 'An unexpected error occurred'
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
// Inicio del servidor
// app.use(cors()).listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))
app.listen(PORT, ({ hostname, port }: server) =>
    console.log(`Server running at http://${hostname}:${port}`)
)