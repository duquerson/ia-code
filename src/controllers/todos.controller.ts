import { todoModel } from "../models/todo.model.ts";
import type { todo } from "../types/todo.ts";


export class todoController {
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
