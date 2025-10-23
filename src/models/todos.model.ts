import { Todo } from "../services/repositoryMongo.ts";
import { NotFoundError } from "../utils/errors.ts";
import type { todo } from "../types/todo.js"

//--------------------------------------------------------------------------
// Capa de Modelo (Model) - Acceso a datos
// Responsabilidades:
// - Operaciones CRUD en base de datos
// - Validación de existencia de documentos
// - Transformación de datos de BD a JSON
// - Manejo de errores específicos de BD (CastError, ValidationError)
// - No validar formato de entrada (se hace en helpers y rutas)
//--------------------------------------------------------------------------
// Clase para la gestión de tareas en la base de datos
//--------------------------------------------------------------------------

class todoModel {

    static async getAllTodos() {
        const todos = await Todo.find({}).limit(100);
        return todos.map(todo => todo.toJSON());
    }

    static async getTodoById(id: string) {
        const todo = await Todo.findById(id);
        if (!todo) {
            throw new NotFoundError('Tarea no encontrada');
        }
        return todo.toJSON();
    }

    static async createTodo(data: todo) {
        const todo = await Todo.create(data);
        return todo.toJSON();
    }

    static async updateTodo(id: string, data: todo) {
        const todo = await Todo.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });

        if (!todo) {
            throw new NotFoundError('Tarea no encontrada');
        }

        return todo.toJSON();
    }

    static async deleteTodo(id: string) {
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            throw new NotFoundError('Tarea no encontrada');
        }
        return {
            success: true,
            message: 'Tarea eliminada exitosamente',
            id
        };
    }
}

Object.freeze(todoModel);

export { todoModel };

//--------------------------------------------------------------------------