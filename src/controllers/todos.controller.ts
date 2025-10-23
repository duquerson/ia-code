import { todoModel } from "../models/todos.model.ts";
import type { todo } from "../types/todo.d.ts";

//--------------------------------------------------------------------------
// Controlador de tareas que usa el modelo de tareas
// Responsabilidades:
// - Lógica de negocio básica
// - Delegación de operaciones al modelo
// - No realiza validaciones (se manejan en middleware de rutas)
//--------------------------------------------------------------------------

class todoController {

    static async getAllTodos() {
        return await todoModel.getAllTodos();
    }

    static async getTodoById(id: string) {
        return await todoModel.getTodoById(id);
    }

    static async createTodo(data: todo) {
        return await todoModel.createTodo(data);
    }

    static async updateTodo(id: string, data: todo) {
        return await todoModel.updateTodo(id, data);
    }

    static async deleteTodo(id: string) {
        return await todoModel.deleteTodo(id);
    }
}

Object.freeze(todoController);

export { todoController };