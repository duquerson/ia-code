import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { PORT } from './config.ts'
import type { server } from './types/index.ts'
import { testRoutes } from './routes/test.routes.ts'
import { notesRoutes } from './routes/notes.routes.ts'
import { setupErrorHandler } from './middleware/errorHandler.ts'
import logger from './utils/logger.ts'
import { connectDB } from './config/db.ts'

const app = new Elysia({ adapter: node() }).onBeforeHandle(({ set }) => {
    if (set?.headers && 'x-powered-by' in set.headers) {
        delete set.headers['x-powered-by']
    }
})



// Configuración de CORS
app.use(cors())

// Configuración del manejador global de errores
setupErrorHandler(app)

// El manejo global de errores ahora está en el middleware errorHandler

// Registro de rutas
app.use(testRoutes)
app.use(notesRoutes)

// Catch-all para rutas no definidas
app.all('*', ({ set, request }) => {
    const method = request.method
    const url = new URL(request.url).pathname

    logger.warn(`Ruta no encontrada: ${method} ${url}`, {
        method,
        url,
        userAgent: request.headers.get('user-agent')
    })

    set.status = 404
    return {
        error: 'Not Found',
        message: 'La ruta solicitada no existe',
        path: url,
        method,
        timestamp: new Date().toISOString()
    }
})

// Eliminar X-Powered-By después de manejar la petición
app.onAfterHandle?.(({ set }) => {
    if (set?.headers && typeof set.headers === 'object' && 'x-powered-by' in set.headers) {
        try {
            delete set.headers['x-powered-by']
        } catch {
            // Ignorar errores al eliminar la cabecera
        }
    }
})

// Función para iniciar servidor con manejo de errores
const startServer = async (retryCount = 0) => {
    const maxRetries = 3
    const retryDelay = 2000

    try {
        logger.info('Conectando a la base de datos...', { attempt: retryCount + 1 })
        await connectDB()

        logger.info('Iniciando servidor...', { port: PORT })
        app.listen(PORT, ({ hostname, port }: server) => {
            const host = hostname || 'localhost'
            const serverPort = port || PORT
            logger.info('Servidor iniciado exitosamente', {
                url: `http://${host}:${serverPort}`,
                environment: process.env.NODE_ENV || 'development'
            })
        })

    } catch (error) {
        logger.error(`Error iniciando servidor (intento ${retryCount + 1}/${maxRetries + 1})`, {
            error: error instanceof Error ? error.message : error,
            attempt: retryCount + 1
        })

        if (retryCount < maxRetries) {
            logger.info(`Reintentando en ${retryDelay / 1000} segundos...`, { nextAttempt: retryCount + 2 })
            setTimeout(() => startServer(retryCount + 1), retryDelay)
        } else {
            logger.error('No se pudo iniciar el servidor después de varios intentos', {
                maxRetries,
                port: PORT,
                mongodbUri: process.env.MONGODB_URI ? 'Configurada' : 'No configurada'
            })
            process.exit(1)
        }
    }
}

startServer()
