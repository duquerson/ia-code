import { todoModel } from "../models/todo.model.ts";
import type { todo } from "../types/todo.d.ts";
import { validateCreateTodo, validateUpdateTodo, isValidId } from '../helpers/todo.ts';
import { InvalidIdError, ValidationError, NotFoundError, DatabaseError } from '../utils/errors.ts';
//--------------------------------------------------------------------------

//controlador de tareas que usa el modelo de tareas

class todoController {
    static async getAllTodos() {
        try {
            const todos = await todoModel.getAllTodos();
            return todos
        } catch (error) {
            // Envolver en DatabaseError para que el middleware lo maneje
            throw new DatabaseError('Ocurrió un error al obtener las tareas', error instanceof Error ? error.message : String(error));
        }
    }

    static async getTodoById(id: string) {
        try {
            if (!isValidId(id)) {
                throw new InvalidIdError('ID inválido');
            }

            return await todoModel.getTodoById(id);
        } catch (error) {
            // Si el modelo no encuentra la tarea, normalizar a NotFoundError
            if (error instanceof Error && /no encontrada|not found/i.test(error.message)) {
                throw new NotFoundError(error.message);
            }
            throw new DatabaseError('Ocurrió un error al obtener la tarea', error instanceof Error ? error.message : String(error));
        }
    }

    static async createTodo(data: todo) {
        try {
            const parsed = validateCreateTodo(data);
            if (!parsed.success) {
                throw new ValidationError('Datos inválidos');
            }

            return await todoModel.createTodo(parsed.data as todo);
        } catch (error) {
            if (error instanceof ValidationError) throw error;
            throw new DatabaseError('Ocurrió un error al crear la tarea', error instanceof Error ? error.message : String(error));
        }

    }

    static async updateTodo(id: string, data: todo) {
        try {
            if (!isValidId(id)) {
                throw new InvalidIdError('ID inválido');
            }

            const parsed = validateUpdateTodo(data);
            if (!parsed.success) {
                throw new ValidationError('Datos inválidos', parsed.error.format());
            }

            return await todoModel.updateTodo(id, parsed.data as todo);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof InvalidIdError) throw error;
            if (error instanceof Error && /no encontrada|not found/i.test(error.message)) {
                throw new NotFoundError(error.message);
            }
            throw new DatabaseError('Ocurrió un error al actualizar la tarea', error instanceof Error ? error.message : String(error));
        }
    }

    static async deleteTodo(id: string) {
        try {
            if (!isValidId(id)) {
                throw new InvalidIdError('ID inválido');
            }

            return await todoModel.deleteTodo(id);
        } catch (error) {
            if (error instanceof Error && /no encontrada|not found/i.test(error.message)) {
                throw new NotFoundError(error.message);
            }
            throw new DatabaseError('Ocurrió un error al eliminar la tarea', error instanceof Error ? error.message : String(error));
        }
    }
}

Object.freeze(todoController);

export { todoController };