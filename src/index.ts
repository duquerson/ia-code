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
//  Rate Limiting Manual (sin dependencias externas)
//------------------------------

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // Máximo requests
const RATE_LIMIT_WINDOW = 60000; // Ventana en ms (1 minuto)

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
}
//------------------------------------------------
// Inicialización de la aplicación
//------------------------------------------------

const app = new Elysia({ adapter: node() })
    // Configuración de CORS
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
    // Rate Limiting Manual
    .onBeforeHandle(({ request, set }) => {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!checkRateLimit(ip)) {
            set.status = 429;
            return {
                error: 'Too Many Requests',
                message: 'Demasiadas solicitudes, intenta de nuevo más tarde.',
                timestamp: new Date().toISOString()
            };
        }
    })
    // Headers de seguridad (Helmet-like)
    .onAfterHandle(({ set }) => {
        if (set.headers) {
            delete set.headers['x-powered-by'];
            set.headers['X-Content-Type-Options'] = 'nosniff';
            set.headers['X-Frame-Options'] = 'DENY';
            set.headers['X-XSS-Protection'] = '1; mode=block';
            set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
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



