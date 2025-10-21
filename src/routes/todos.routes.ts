
import { Elysia } from 'elysia';
import type { todo } from '../types/todo.d.ts';

import { todoController } from '../controllers/todos.controller.ts';

//------------------------------------------------------------------------------

// Rutas para la gestión de tareas

export const todosRoutes = new Elysia({ prefix: '/api/v1/todos' })

    //obtiene todas las tareas

    .get('/', async () => {
        return await todoController.getAllTodos();
    })

    //obtiene una tarea por id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .get('/:id', async (ctx: any) => {
        const params = ctx.params as { id: string };
        return await todoController.getTodoById(params.id);
    })

    //crea una nueva tarea

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .post('/', async (ctx: any) => {
        const body = ctx.body as todo;
        return await todoController.createTodo(body);
    })

    // Actualiza parcialmente una tarea

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .patch('/:id', async (ctx: any) => {
        const params = ctx.params as { id: string };
        const body = ctx.body as todo;
        return await todoController.updateTodo(params.id, body);
    })

    // Actualiza completamente una tarea

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .put('/:id', async (ctx: any) => {
        const params = ctx.params as { id: string };
        const body = ctx.body as todo;
        return await todoController.updateTodo(params.id, body);
    })

    // Elimina una tarea

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .delete('/:id', async (ctx: any) => {
        const params = ctx.params as { id: string };
        return await todoController.deleteTodo(params.id);
    });


//------------------------------------------------------------------------------