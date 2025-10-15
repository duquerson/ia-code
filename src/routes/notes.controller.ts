import { NotesService } from '../services/notes.service.ts';
import logger from '../utils/logger.ts';

/**
 * Controlador de Notas con arquitectura MVC avanzada
 * Implementa métodos internos y fachada de métodos estáticos públicos
 * Patrón Singleton para acceso directo sin almacenamiento intermedio
 */
class NotesControllerInternal {
    private constructor() {
        // Constructor privado para prevenir instanciación directa
        Object.freeze(this);
    }

    /**
     * Obtiene todas las notas (método interno)
     * Método interno para la lógica de presentación
     */
    static async getAllNotes() {
        logger.info('Petición: GET /api/notes');

        const notes = await NotesService.getAllNotes();

        return {
            message: 'Notas obtenidas exitosamente',
            count: notes.length,
            notes,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Obtiene una nota por ID (método interno)
     * Método interno para la lógica de presentación
     */
    static async getNoteById(id: string) {
        logger.info(`Petición: GET /api/notes/${id}`);

        return await NotesService.getNoteById(id);
    }

    /**
     * Crea una nueva nota (método interno)
     * Método interno para la lógica de presentación
     */
    static async createNote(data: { content: string; date?: string; important?: boolean }) {
        logger.info('Petición: POST /api/notes', { content: data.content });

        const note = await NotesService.createNote(data);

        return {
            message: 'Nota creada exitosamente',
            note,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Actualiza una nota (método interno)
     * Método interno para la lógica de presentación
     */
    static async updateNote(id: string, data: { content: string; important?: boolean }) {
        logger.info(`Petición: PATCH /api/notes/${id}`);

        const note = await NotesService.updateNote(id, data);

        return {
            message: 'Nota actualizada exitosamente',
            note,
            updatedAt: note.updatedAt
        };
    }

    /**
     * Elimina una nota (método interno)
     * Método interno para la lógica de presentación
     */
    static async deleteNote(id: string) {
        logger.info(`Petición: DELETE /api/notes/${id}`);

        await NotesService.deleteNote(id);

        return {
            message: 'Nota eliminada exitosamente',
            id,
            deletedAt: new Date().toISOString()
        };
    }
}

/**
 * Fachada de métodos estáticos públicos para acceso directo
 * Implementa patrón Singleton para acceso inmediato sin almacenamiento intermedio
 * Uso directo: NotesController.getAllNotes()
 */
export class NotesController {
    private constructor() {
        // Constructor privado - no se puede instanciar
        Object.freeze(this);
    }

    /**
     * Obtiene todas las notas (método público estático)
     * Acceso directo: NotesController.getAllNotes()
     */
    public static async getAllNotes() {
        return NotesControllerInternal.getAllNotes();
    }

    /**
     * Obtiene una nota por ID (método público estático)
     * Acceso directo: NotesController.getNoteById(id)
     */
    public static async getNoteById(id: string) {
        return NotesControllerInternal.getNoteById(id);
    }

    /**
     * Crea una nueva nota (método público estático)
     * Acceso directo: NotesController.createNote(data)
     */
    public static async createNote(data: { content: string; date?: string; important?: boolean }) {
        return NotesControllerInternal.createNote(data);
    }

    /**
     * Actualiza una nota (método público estático)
     * Acceso directo: NotesController.updateNote(id, data)
     */
    public static async updateNote(id: string, data: { content: string; important?: boolean }) {
        return NotesControllerInternal.updateNote(id, data);
    }

    /**
     * Elimina una nota (método público estático)
     * Acceso directo: NotesController.deleteNote(id)
     */
    public static async deleteNote(id: string) {
        return NotesControllerInternal.deleteNote(id);
    }
}
