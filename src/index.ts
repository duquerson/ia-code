import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { todosRoutes } from './routes/todos.routes.ts'        // sin .ts
import { setupErrorHandler } from './middleware/errorHandler.ts'

import { connectDB, disconnectDB, DATA } from './config/conectDB.ts'

// Valores por defecto
const serverPort = DATA.PORT
const host = DATA.HOST

const app = new Elysia({ adapter: node() })
    // Configuración de CORS
    .use(cors())
    // ✅ Eliminar X-Powered-By header
    .onAfterHandle(({ set }) => {
        if (set.headers) {
            delete set.headers['x-powered-by']
        }
    })
// Error handler (plugin/hook)
setupErrorHandler(app)

// Rutas
app.use(todosRoutes)

// Catch-all 404
app.all('*', ({ set, request }) => {
    const method = request.method
    const url = new URL(request.url).pathname

    set.status = 404
    return {
        error: 'Not Found',
        message: 'La ruta solicitada no existe',
        path: url,
        method,
        timestamp: new Date().toISOString()
    }
})


async function start() {
    try {
        await connectDB()

        await app.listen(serverPort)
        console.log('🚀 Servidor iniciado exitosamente', {
            url: `http://${host}:${serverPort}`,

            port: serverPort
        })
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error('❌ No se pudo conectar o iniciar el servidor:', {
            error: errorMessage,
            mongodbUri: DATA.APIDB ? 'Configurada' : 'No configurada'
        })
        process.exit(1)
    }
}
start()

// Graceful shutdown para SIGINT y SIGTERM
async function gracefulShutdown(code = 0) {
    console.log('⏳ Cerrando servidor...')
    try {
        await disconnectDB()
        console.log('✅ Conexión a BD cerrada correctamente')
        console.log('👋 Servidor cerrado')
        process.exit(code)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error('❌ Error cerrando conexión:', { error: errorMessage })
        process.exit(1)
    }
}

process.on('SIGINT', () => gracefulShutdown(0))
process.on('SIGTERM', () => gracefulShutdown(0))
