import { Notes } from '../models/Notes.ts';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.ts';
import { validateObjectId } from '../middleware/validators.ts';
import logger from '../utils/logger.ts';

export interface Note {
    id: string;
    content: string;
    date: Date;
    important: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
}

export interface CreateNoteDto {
    content: string;
    date?: string | Date;
    important?: boolean;
}

export interface UpdateNoteDto {
    content: string;
    important?: boolean;
}

/**
 * Servicio de Notas con arquitectura MVC avanzada
 * Implementa métodos internos y fachada de métodos estáticos públicos
 * Patrón Singleton para acceso directo sin almacenamiento intermedio
 */
class NotesServiceInternal {
    private constructor() {
        // Constructor privado para prevenir instanciación directa
        Object.freeze(this);
    }

    /**
     * Obtiene todas las notas (método interno)
     * Método interno para la lógica de negocio
     */
    static async getAllNotes(): Promise<Note[]> {
        try {
            logger.debug('Obteniendo todas las notas');

            const notes = await Notes.find({})
                .sort({ date: -1 })
                .limit(100)
                .select('content date important createdAt updatedAt')
                .lean()
                .exec();

            logger.info(`Se obtuvieron ${notes.length} notas`);

            return notes.map(note => this.formatNote(note));

        } catch (error) {
            logger.error('Error al obtener notas', { error });
            throw new DatabaseError('Error al obtener las notas', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Obtiene una nota por su ID (método interno)
     * Método interno para la lógica de negocio
     */
    static async getNoteById(id: string): Promise<Note> {
        validateObjectId(id);

        try {
            logger.debug(`Buscando nota con ID: ${id}`);

            const note = await Notes.findById(id)
                .select('content date important createdAt updatedAt')
                .lean()
                .exec();

            if (!note) {
                logger.warn(`Nota no encontrada: ${id}`);
                throw new NotFoundError('Nota', id);
            }

            logger.info(`Nota encontrada: ${id}`);
            return this.formatNote(note);

        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error al buscar nota ${id}`, { error });
            throw new DatabaseError('Error al obtener la nota', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Crea una nueva nota (método interno)
     * Método interno para la lógica de negocio
     */
    static async createNote(data: CreateNoteDto): Promise<Note> {
        try {
            logger.debug('Creando nueva nota', { content: data.content });

            const newNote = new Notes({
                content: data.content,
                date: data.date ? new Date(data.date) : new Date(),
                important: data.important ?? false
            });

            const savedNote = await newNote.save();

            logger.info(`Nota creada exitosamente: ${savedNote._id}`);
            return this.formatNote(savedNote.toObject());

        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
                const mongooseError = error as { errors?: Record<string, { message: string }> };
                const messages = Object.values(mongooseError.errors || {})
                    .map((err: { message: string }) => err.message);
                logger.warn('Error de validación al crear nota', { messages });
                throw new ValidationError('Datos inválidos', { messages });
            }

            logger.error('Error al crear nota', { error });
            throw new DatabaseError('Error al crear la nota', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Actualiza una nota existente (método interno)
     * Método interno para la lógica de negocio
     */
    static async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
        validateObjectId(id);

        try {
            logger.debug(`Actualizando nota: ${id}`, { data });

            const updateData = {
                content: data.content,
                important: data.important ?? false
            };

            const updatedNote = await Notes.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .select('content date important createdAt updatedAt')
                .lean()
                .exec();

            if (!updatedNote) {
                logger.warn(`Nota no encontrada para actualizar: ${id}`);
                throw new NotFoundError('Nota', id);
            }

            logger.info(`Nota actualizada exitosamente: ${id}`);
            return this.formatNote(updatedNote);

        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
                const mongooseError = error as { errors?: Record<string, { message: string }> };
                const messages = Object.values(mongooseError.errors || {})
                    .map((err: { message: string }) => err.message);
                logger.warn('Error de validación al actualizar nota', { messages });
                throw new ValidationError('Datos inválidos', { messages });
            }

            logger.error(`Error al actualizar nota ${id}`, { error });
            throw new DatabaseError('Error al actualizar la nota', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Elimina una nota (método interno)
     * Método interno para la lógica de negocio
     */
    static async deleteNote(id: string): Promise<void> {
        validateObjectId(id);

        try {
            logger.debug(`Eliminando nota: ${id}`);

            const deletedNote = await Notes.findByIdAndDelete(id).exec();

            if (!deletedNote) {
                logger.warn(`Nota no encontrada para eliminar: ${id}`);
                throw new NotFoundError('Nota', id);
            }

            logger.info(`Nota eliminada exitosamente: ${id}`);

        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(`Error al eliminar nota ${id}`, { error });
            throw new DatabaseError('Error al eliminar la nota', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Formatea una nota de MongoDB a nuestro formato (método interno)
     * Método interno para formateo de datos
     */
    private static formatNote(note: Record<string, unknown>): Note {
        return Object.freeze({
            id: note._id?.toString() || (note.id as string) || '',
            content: note.content as string,
            date: note.date as Date,
            important: Boolean(note.important ?? false),
            createdAt: note.createdAt as Date | undefined,
            updatedAt: note.updatedAt as Date | undefined
        });
    }
}

/**
 * Fachada de métodos estáticos públicos para acceso directo
 * Implementa patrón Singleton para acceso inmediato sin almacenamiento intermedio
 * Uso directo: NotesService.getAllNotes()
 */
export class NotesService {
    private constructor() {
        // Constructor privado - no se puede instanciar
        Object.freeze(this);
    }

    /**
     * Obtiene todas las notas (método público estático)
     * Acceso directo: NotesService.getAllNotes()
     */
    public static async getAllNotes(): Promise<Note[]> {
        return NotesServiceInternal.getAllNotes();
    }

    /**
     * Obtiene una nota por su ID (método público estático)
     * Acceso directo: NotesService.getNoteById(id)
     */
    public static async getNoteById(id: string): Promise<Note> {
        return NotesServiceInternal.getNoteById(id);
    }

    /**
     * Crea una nueva nota (método público estático)
     * Acceso directo: NotesService.createNote(data)
     */
    public static async createNote(data: CreateNoteDto): Promise<Note> {
        return NotesServiceInternal.createNote(data);
    }

    /**
     * Actualiza una nota existente (método público estático)
     * Acceso directo: NotesService.updateNote(id, data)
     */
    public static async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
        return NotesServiceInternal.updateNote(id, data);
    }

    /**
     * Elimina una nota (método público estático)
     * Acceso directo: NotesService.deleteNote(id)
     */
    public static async deleteNote(id: string): Promise<void> {
        return NotesServiceInternal.deleteNote(id);
    }
}
