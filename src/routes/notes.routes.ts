/**
 * Rutas de Notas - VERSIÓN LIMPIA Y REFACTORIZADA
 *
 * Este archivo SOLO define las rutas y sus validaciones
 * Toda la lógica está en:
 * - Controller: Orquestación de la petición
 * - Service: Lógica de negocio
 * - Error Handler Global: Manejo de errores centralizado
 */

import { Elysia, t } from 'elysia';
import { NotesController } from './notes.controller.ts';

/**
 * Rutas de Notas con métodos estáticos e inmutables
 * Utiliza controlador con métodos estáticos para mayor seguridad y operaciones de solo lectura
 */
export const notesRoutes = new Elysia({ prefix: '/api/notes' })

    /**
     * GET /api/notes
     * Obtiene todas las notas usando métodos estáticos
     */
    .get('/', async ({ set }) => {
        set.status = 200;
        return await NotesController.getAllNotes();
    })

    /**
     * GET /api/notes/:id
     * Obtiene una nota por ID usando métodos estáticos
     */
    .get('/:id', async ({ params, set }) => {
        set.status = 200;
        return await NotesController.getNoteById(params.id);
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB'
            })
        })
    })

    /**
     * POST /api/notes
     * Crea una nueva nota usando métodos estáticos
     */
    .post('/', async ({ body, set }) => {
        set.status = 201;
        return await NotesController.createNote(body);
    }, {
        body: t.Object({
            content: t.String({
                minLength: 1,
                maxLength: 2000,
                error: 'El contenido debe tener entre 1 y 2000 caracteres'
            }),
            date: t.Optional(t.String()),
            important: t.Optional(t.Boolean())
        })
    })

    /**
     * PATCH /api/notes/:id
     * Actualiza parcialmente una nota usando métodos estáticos
     */
    .patch('/:id', async ({ params, body, set }) => {
        set.status = 200;
        return await NotesController.updateNote(params.id, body);
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB'
            })
        }),
        body: t.Object({
            content: t.String({
                minLength: 1,
                maxLength: 2000,
                error: 'El contenido debe tener entre 1 y 2000 caracteres'
            }),
            important: t.Optional(t.Boolean())
        })
    })

    /**
     * PUT /api/notes/:id
     * Actualiza completamente una nota usando métodos estáticos
     */
    .put('/:id', async ({ params, body, set }) => {
        set.status = 200;
        return await NotesController.updateNote(params.id, body);
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB'
            })
        }),
        body: t.Object({
            content: t.String({
                minLength: 1,
                maxLength: 2000,
                error: 'El contenido debe tener entre 1 y 2000 caracteres'
            }),
            important: t.Optional(t.Boolean())
        })
    })

    /**
     * DELETE /api/notes/:id
     * Elimina una nota usando métodos estáticos
     */
    .delete('/:id', async ({ params, set }) => {
        await NotesController.deleteNote(params.id);
        set.status = 204;
        return {
            message: 'Nota eliminada exitosamente',
            id: params.id,
            deletedAt: new Date().toISOString()
        };
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB'
            })
        })
    });
