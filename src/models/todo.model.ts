import { model } from "mongoose";
import type { todo } from "../types/todo.ts";
import { TODO } from "../schema/schemaDB.ts";


//--------------------------------------------------------------------------
// model db de mongo usando el schema de mongoose
//--------------------------------------------------------------------------

const Todo = model('Todos', TODO);

//--------------------------------------------------------------------------

// Clase para la gestión de tareas en la base de datos

//--------------------------------------------------------------------------

class todoModel {

    static async getAllTodos() {
        try {
            const todos = await Todo.find({}).limit(100);
            return todos.map(todo => todo.toJSON());
        } catch (error) {
            throw new Error(`Error al obtener tareas`);
        }
    }

    static async getTodoById(id: string) {
        const todo = await Todo.findById(id);
        if (!todo) {
            throw new Error('Tarea no encontrada');
        }
        const todoJSON = todo.toJSON();
        return {
            id: todoJSON.id,
            description: todoJSON.description,
            completed: todoJSON.completed
        };
    }

    static async createTodo(data: todo) {
        const todo = await Todo.create(data);
        if (!todo) {
            throw new Error('Error al crear la tarea');
        }
        const todoJSON = todo.toJSON();
        return {
            id: todoJSON.id,
            description: todoJSON.description,
            completed: todoJSON.completed
        };
    }

    static async updateTodo(id: string, data: todo) {
        try {
            const todo = await Todo.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!todo) {
                throw new Error('Tarea no encontrada');
            }
            const todoJSON = todo.toJSON();
            return {
                id: todoJSON.id,
                description: todoJSON.description,
                completed: todoJSON.completed
            };
        } catch (error) {
            throw new Error(`Error al actualizar tarea`);
        }
    }

    static async deleteTodo(id: string) {
        try {
            const todo = await Todo.findByIdAndDelete(id);
            if (!todo) {
                throw new Error('Tarea no encontrada');
            }
        } catch (error) {
            throw new Error(`Error al eliminar tarea`);
        }

        return { message: 'Tarea eliminada exitosamente', id };
    }

}

Object.freeze(todoModel);
export { todoModel };

//--------------------------------------------------------------------------