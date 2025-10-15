import { Elysia, t } from 'elysia'
import { Notes } from '../models/Notes.ts';
import mongoose from 'mongoose';
import logger from '../utils/logger.ts';

// Función para validar ObjectId de MongoDB
const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Los errores ahora son manejados por el manejador global

export const testRoutes = new Elysia({ prefix: '/api/test' })
    .get('/', async ({ set }) => {
        try {
            // Obtener notas con campos requeridos + timestamps
            const notes = await Notes.find({})
                .sort({ date: -1 }) // Ordenar por fecha más reciente primero
                .limit(100) // Limitar resultados para evitar sobrecarga
                .select('content date important createdAt updatedAt') // Incluir timestamps
                .exec(); // Usar .exec() para obtener una Promise nativa

            return {
                message: 'Notas obtenidas exitosamente',
                count: notes.length,
                notes,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error en GET /', { error: error instanceof Error ? error.message : error });
            throw error;
        }
    })

    .get('/:id', async ({ params, set }) => {
        try {
            // Validar ID antes de consultar
            if (!isValidObjectId(params.id)) {
                set.status = 400;
                return {
                    error: 'Invalid ID',
                    message: 'El ID proporcionado no es válido',
                    providedId: params.id
                };
            }

            const note = await Notes.findById(params.id)
                .select('content date important createdAt updatedAt'); // Incluir timestamps

            if (!note) {
                set.status = 404;
                return {
                    error: 'Not Found',
                    message: 'Nota no encontrada',
                    id: params.id
                };
            }

            return note;
        } catch (error) {
            logger.error('Error en GET /:id', { error: error instanceof Error ? error.message : error });
            throw error;
        }
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
            })
        })
    })

    .delete('/:id', async ({ params, set }) => {
        try {
            // Validar ID antes de consultar
            if (!isValidObjectId(params.id)) {
                set.status = 400;
                return {
                    error: 'Invalid ID',
                    message: 'El ID proporcionado no es válido',
                    providedId: params.id
                };
            }

            const deletedNote = await Notes.findByIdAndDelete(params.id);

            if (!deletedNote) {
                set.status = 404;
                return {
                    error: 'Not Found',
                    message: 'Nota no encontrada para eliminar',
                    id: params.id
                };
            }

            set.status = 204;
            return {
                message: 'Nota eliminada exitosamente',
                id: params.id,
                deletedAt: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error en DELETE /:id', { error: error instanceof Error ? error.message : error });
            throw error;
        }
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
            })
        })
    })

    .patch('/:id', async ({ params, body, set }) => {
        try {
            // Validar ID antes de consultar
            if (!isValidObjectId(params.id)) {
                set.status = 400;
                return {
                    error: 'Invalid ID',
                    message: 'El ID proporcionado no es válido',
                    providedId: params.id
                };
            }

            // Actualizar campos permitidos según requerimientos
            // updatedAt se actualizará automáticamente gracias a timestamps: true en el esquema
            const updateData = {
                content: body.content,
                important: body.important ?? false, // ✅ Permitir actualización del campo important
                // updatedAt se establece automáticamente por Mongoose
            };

            // Usar opciones exactas según requerimientos: { new: true, runValidators: true }
            const updatedNote = await Notes.findByIdAndUpdate(
                params.id,
                updateData,
                {
                    new: true,           // Retorna el documento actualizado
                    runValidators: true  // Ejecuta validaciones del esquema
                    // upsert: false es el comportamiento por defecto
                }
            ).select('id content date important createdAt updatedAt'); // Campos específicos requeridos

            if (!updatedNote) {
                set.status = 404;
                return {
                    error: 'Not Found',
                    message: 'Nota no encontrada para actualizar',
                    id: params.id
                };
            }

            // Devolver respuesta en formato JSON con campos específicos
            return {
                message: 'Nota actualizada exitosamente',
                note: {
                    id: updatedNote.id || '',
                    content: updatedNote.content,
                    date: updatedNote.date,
                    important: updatedNote.important ?? false, // ✅ Asegurar valor por defecto
                    createdAt: updatedNote.createdAt || new Date(),
                    updatedAt: updatedNote.updatedAt || new Date()
                },
                updatedAt: updatedNote.updatedAt || new Date()
            };
        } catch (error) {
            logger.error('Error en PATCH /:id', { error: error instanceof Error ? error.message : error });
            throw error;
        }
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
            })
        }),
        body: t.Object({
            content: t.String({
                minLength: 1,
                maxLength: 2000,
                error: 'El contenido debe tener entre 1 y 2000 caracteres'
            }),
            important: t.Optional(t.Boolean()) // ✅ Permitir actualización opcional del campo important
        })
    })

    .put('/:id', async ({ params, body, set }) => {
        try {
            // Validar ID antes de consultar
            if (!isValidObjectId(params.id)) {
                set.status = 400;
                return {
                    error: 'Invalid ID',
                    message: 'El ID proporcionado no es válido',
                    providedId: params.id
                };
            }

            // Actualizar campos permitidos según requerimientos
            // updatedAt se actualizará automáticamente gracias a timestamps: true en el esquema
            const updateData = {
                content: body.content,
                important: body.important ?? false, // ✅ Permitir actualización del campo important
                // updatedAt se establece automáticamente por Mongoose
            };

            // Usar opciones exactas según requerimientos: { new: true, runValidators: true }
            const updatedNote = await Notes.findByIdAndUpdate(
                params.id,
                updateData,
                {
                    new: true,           // Retorna el documento actualizado
                    runValidators: true  // Ejecuta validaciones del esquema
                    // upsert: false es el comportamiento por defecto
                }
            ).select('id content date important createdAt updatedAt'); // Campos específicos requeridos

            if (!updatedNote) {
                set.status = 404;
                return {
                    error: 'Not Found',
                    message: 'Nota no encontrada para actualizar',
                    id: params.id
                };
            }

            // Devolver respuesta en formato JSON con campos específicos
            return {
                message: 'Nota actualizada exitosamente',
                note: {
                    id: updatedNote.id || '',
                    content: updatedNote.content,
                    date: updatedNote.date,
                    important: updatedNote.important ?? false, // ✅ Asegurar valor por defecto
                    createdAt: updatedNote.createdAt || new Date(),
                    updatedAt: updatedNote.updatedAt || new Date()
                },
                updatedAt: updatedNote.updatedAt || new Date()
            };
        } catch (error) {
            logger.error('Error en PUT /:id', { error: error instanceof Error ? error.message : error });
            throw error;
        }
    }, {
        params: t.Object({
            id: t.String({
                minLength: 24,
                maxLength: 24,
                pattern: '^[0-9a-fA-F]{24}$',
                error: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
            })
        }),
        body: t.Object({
            content: t.String({
                minLength: 1,
                maxLength: 2000,
                error: 'El contenido debe tener entre 1 y 2000 caracteres'
            }),
            important: t.Optional(t.Boolean()) // ✅ Permitir actualización opcional del campo important
        })
    })

    .post('/', async ({ body, set }) => {
        try {
            const newNote = new Notes({
                content: body.content,
                date: body.date ? new Date(body.date) : new Date(),
                important: body.important ?? false // ✅ Asegurar valor por defecto si no se proporciona
            });

            const savedNote = await newNote.save();

            // Devolver solo los campos requeridos
            const result = {
                id: savedNote._id?.toString() || '',
                content: savedNote.content,
                date: savedNote.date,
                important: savedNote.important ?? false, // ✅ Asegurar valor por defecto
                timestamp: new Date() // Usar fecha actual como timestamp
            };

            set.status = 201;
            return result;
        } catch (error) {
            logger.error('Error en POST /', { error: error instanceof Error ? error.message : error });
            throw error;
        }
    }, {
        body: t.Object({
            content: t.String({ minLength: 1 }),
            date: t.Optional(t.String()),
            important: t.Optional(t.Boolean())
        })
    });