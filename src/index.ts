import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { todosRoutes } from './routes/todos.routes.ts'        // sin .ts
import { AppError } from './utils/errors.ts'
import { connectDB } from './config/mongodb/conectDB.ts'
import { onErrors } from './middleware/handlerErros.ts'
import { logger } from './utils/logger.ts'
import { DATA } from './utils/const.ts'

//------------------------------------------------
//  Variables de configuración
//------------------------------

const serverPort = DATA.PORT;
const host = DATA.HOST;
//------------------------------------------------
// Inicialización de la aplicación
//------------------------------------------------

const app = new Elysia({ adapter: node() })
    // Configuración de CORS pending
    .use(cors({
        origin: (request) => {
            const allowed = [DATA.HOST, 'https://admin.example.com'];
            const origin = request.headers.get('origin') ?? '';
            return allowed.includes(origin);
        },
        maxAge: 600, // 10 minutos
        methods:
            ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    }))
    // ✅ Eliminar X-Powered-By header
    .onAfterHandle(({ set }) => {
        if (set.headers) {
            delete set.headers['x-powered-by']
        }
    })

//------------------------------------------------
// Middleware para manejo de errores globales
//------------------------------------------------
app.use(onErrors)
//------------------------------------------------
// Rutas de gestión de tareas
//------------------------------------------------
app.use(todosRoutes)

//------------------------------------------------
// Manejador de rutas no encontradas (404)
//------------------------------------------------
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
//------------------------------------------------
// Inicio del servidor
//------------------------------------------------
async function start() {
    try {
        await connectDB()
        await app.listen(serverPort)
        logger.info('🚀 Servidor iniciado exitosamente', {
            url: `http://${host}:${serverPort}`,
            port: serverPort
        })
    } catch (error) {
        if (error instanceof AppError) {
            logger.error('Error de conexión a la base de datos:', { message: error.message });

            throw error;
        }

        throw error;
    }
}
start().catch((error) => {
    logger.error('Error fatal al iniciar el servidor:', {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
});



