import { model } from "mongoose";
import type { todo } from "../types/todo.ts";
import { todoSchema, type TodoDocument } from "../schema/mongoDB.ts";
//model db de mongo usando el schema de mongoose

const Todo = model<TodoDocument>('Todos', todoSchema);

export class todoModel {
    static async getAllTodos() {
        const todos = await Todo.find({});
        if (!todos) {
            throw new Error('No se encontraron tareas');
        }
        return todos.map(todo => {
            const { id, description, completed } = todo.toJSON();
            return { id, description, completed };
        });
    }

    static async getTodoById(id: string) {
        const todo = await Todo.findById(id);
        if (!todo) {
            throw new Error('Tarea no encontrada');
        }
        const { description, completed } = todo.toJSON();
        return { id, description, completed };

    }

    static async createTodo(data: todo) {
        const todo = await Todo.create(data);
        if (!todo) {
            throw new Error('Error al crear la tarea');
        }
        todo.toJSON();
        return { id: todo.id, description: todo.description, completed: todo.completed };
    }

    static async updateTodo(id: string, data: todo) {
        const todo = await Todo.findByIdAndUpdate(id, data, { new: true });
        if (!todo) {
            throw new Error('Tarea no encontrada');
        }
        todo.toJSON();
        return { id: todo.id, description: todo.description, completed: todo.completed };
    }

    static async deleteTodo(id: string) {
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            throw new Error('Tarea no encontrada');
        }
    }

}

