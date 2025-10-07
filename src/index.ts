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

import { Elysia, t } from 'elysia'
import { node } from '@elysiajs/node'
import { PORT } from '../config.js';
import type { server } from './types/index.js';
import { data } from './mock/index.js';
import { cors } from '@elysiajs/cors';
/**
 * Configuración de la aplicación Elysia con adaptador Node.js
 * Permite ejecutar la aplicación en un servidor HTTP estándar
 */
const app = new Elysia({ adapter: node() });

/**
 * Ruta raíz - Devuelve todas las notas de prueba
 *
 * @route GET /
 * @returns {Array} Lista de todas las notas de prueba
 *
 * Ejemplo de respuesta:
 * [
 *   { id: 1, content: "Nota 1", date: "2025-01-01", important: true },
 *   { id: 2, content: "Nota 2", date: "2025-01-02", important: false }
 * ]
 */
app.get('/', () => data.test)

/**
 * Ruta de prueba - Devuelve una página HTML simple
 *
 * @route GET /test
 * @returns {Response} Página HTML con mensaje de prueba
 */
app.get('/test', () => {
    return new Response('<h1>Test route</h1>', {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })
})

/**
 * Obtener una nota específica por ID
 *
 * @route GET /api/test/:id
 * @param {Object} params - Parámetros de la ruta
 * @param {number} params.id - ID único de la nota
 * @param {Object} set - Objeto para establecer el estado de la respuesta
 * @returns {Object} Nota encontrada o error 404
 *
 * Ejemplo de uso:
 * GET /api/test/1
 *
 * Respuesta exitosa (200):
 * { id: 1, content: "Nota 1", date: "2025-01-01", important: true }
 *
 * Error (404):
 * { error: 'Not found' }
 */
app.get('/api/test/:id', ({ params, set }) => {
    const foundItem = data.test.find(item => item.id === params.id);
    if (!foundItem) {
        set.status = 404;
        return { error: 'Not found' };
    }
    return foundItem;
}, {
    params: t.Object({
        id: t.Number()
    })
})

/**
 * Eliminar una nota por ID
 *
 * @route DELETE /api/test/:id
 * @param {Object} params - Parámetros de la ruta
 * @param {number} params.id - ID único de la nota a eliminar
 * @param {Object} set - Objeto para establecer el estado de la respuesta
 * @returns {void} Respuesta vacía con código 204 o error 404
 *
 * Ejemplo de uso:
 * DELETE /api/test/1
 *
 * Respuesta exitosa (204): No content
 * Error (404): { error: 'Item not found' }
 */
app.delete('/api/test/:id', ({ params, set }) => {
    const itemIndex = data.test.findIndex(item => item.id === params.id);

    if (itemIndex === -1) {
        set.status = 404;
        return { error: 'Item not found' };
    }

    data.test = data.test.filter(item => item.id !== params.id);
    set.status = 204;
}, {
    params: t.Object({
        id: t.Number()
    })
})

/**
 * Crear una nueva nota
 *
 * @route POST /api/test
 * @param {Object} body - Datos de la nueva nota
 * @param {number} body.id - ID único de la nota
 * @param {string} body.content - Contenido de la nota
 * @param {string} body.date - Fecha de creación (opcional, por defecto fecha actual)
 * @param {boolean} body.important - Indica si la nota es importante (opcional, por defecto false)
 * @param {Object} set - Objeto para establecer el estado de la respuesta
 * @returns {Object} Nota creada con código 201 o error 400
 *
 * Ejemplo de uso:
 * POST /api/test
 * Content-Type: application/json
 *
 * {
 *   "id": 3,
 *   "content": "Nueva nota",
 *   "date": "2025-01-03",
 *   "important": true
 * }
 *
 * Respuesta exitosa (201):
 * {
 *   "id": 3,
 *   "content": "Nueva nota",
 *   "date": "2025-01-03",
 *   "important": true
 * }
 *
 * Error (400):
 * { error: 'Missing id or content' }
 */
app.post('/api/test', ({ body, set }) => {

    if (!body.id || !body.content) {
        set.status = 400;
        return { error: 'Missing id or content' };
    }



    const newItem = {
        id: body.id,
        content: body.content,
        date: body.date ?? new Date().toISOString(),
        important: body.important ?? false
    };


    data.test = [...data.test, newItem];
    set.status = 201;
    return newItem;
}, {
    body: t.Object({
        id: t.Number(),
        content: t.String(),
        date: t.String(),
        important: t.Boolean()
    })
})

/**
 * Iniciar el servidor HTTP
 *
 * @param {number} PORT - Puerto donde se ejecutará el servidor
 * @param {Function} callback - Función callback que se ejecuta cuando el servidor está listo
 * @param {string} callback.hostname - Nombre del host donde se ejecuta el servidor
 * @param {number} callback.port - Puerto donde se ejecuta el servidor
 */
app.use(cors()).listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))