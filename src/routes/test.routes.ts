import { Elysia, t } from 'elysia'
import Note from '../models/Note.ts';

export const testRoutes = new Elysia({ prefix: '/api/test' })
    .get('/', async () => {
        const notes = await Note.find({});
        return notes;
    })

    .get('/:id', async ({ params, set }) => {
        try {
            const note = await Note.findById(params.id);

            if (!note) {
                set.status = 404;
                return { error: 'Nota no encontrada' };
            }
            return note;
        } catch (error) {
            set.status = 400;
            return { error: 'ID inválido' };
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    .delete('/:id', async ({ params, set }) => {
        try {
            const deletedNote = await Note.findByIdAndDelete(params.id);

            if (!deletedNote) {
                set.status = 404;
                return { error: 'Nota no encontrada' };
            }

            set.status = 204;
        } catch (error) {
            set.status = 400;
            return { error: 'ID inválido' };
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    .put('/:id', async ({ params, body, set }) => {
        try {
            const updatedNote = await Note.findByIdAndUpdate(
                params.id,
                {
                    content: body.content,
                    date: body.date,
                    important: body.important
                },
                { new: true, runValidators: true }
            );

            if (!updatedNote) {
                set.status = 404;
                return { error: 'Nota no encontrada' };
            }

            return updatedNote;
        } catch (error) {
            set.status = 400;
            return { error: 'ID inválido o datos incorrectos' };
        }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            content: t.String(),
            date: t.String(),
            important: t.Boolean()
        })
    })

    .post('/', async ({ body, set }) => {
        try {
            const newNote = new Note({
                content: body.content,
                date: body.date,
                important: body.important ?? false
            });

            const savedNote = await newNote.save();
            set.status = 201;
            return savedNote;
        } catch (error) {
            console.error('Error al crear nota:', error);
            set.status = 500;
            return { 
                error: 'Error al crear la nota',
                details: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }, {
        body: t.Object({
            content: t.String(),
            date: t.String(),
            important: t.Optional(t.Boolean())
        })
    })
    .all('*', ({ set, request }) => {
        set.status = 400;
        return {
            error: 'Bad Request',
            message: `Method ${request.method} not allowed or route not found`
        };
    });