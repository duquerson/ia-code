
import { Elysia } from 'elysia';
import { Todo } from '../models/todo.model.ts';
import { validateCreateTodo, validateUpdateTodo, isValidId } from '../helpers/todo.ts';

//------------------------------------------------------------------------------

// Rutas para la gestión de tareas

export const todosRoutes = new Elysia({ prefix: '/api/v1/todos' })

    //obtiene todas las tareas

    .get('/', async ({ set }) => {
        const todos = await Todo.find({});
        if (!todos) {
            set.status = 500;
            return {
                error: 'Error del servidor',
                message: 'Ocurrió un error al obtener las tareas',
                timestamp: new Date().toISOString()
            };
        }
        set.status = 200;
        return todos.map(todo => todo.toJSON());
    })

    //obtiene una tarea por id

    .get('/:id', async ({ params, set }) => {
        if (!isValidId(params.id)) {
            set.status = 400;
            return {
                error: 'ID inválido',
                message: 'El ID proporcionado no es válido',
                timestamp: new Date().toISOString()
            };
        }
        const todo = await Todo.findById(params.id);
        if (!todo) {
            set.status = 404;
            return {
                error: 'Tarea no encontrada',
                message: `No se encontró ninguna tarea con el ID: ${params.id}`,
                timestamp: new Date().toISOString()
            };
        }
        set.status = 200;
        return todo?.toJSON();
    })

    //crea una nueva tarea

    .post('/', async ({ body, set }) => {
        const validation = validateCreateTodo(body);
        if (!validation.success) {
            set.status = 400;
            return {
                error: 'Datos inválidos',
                message: 'Los datos proporcionados no son válidos',
                timestamp: new Date().toISOString()
            };
        }
        const newTodo = await Todo.create(validation.data);
        set.status = 201;
        return newTodo?.toJSON();
    })

    // Actualiza parcialmente una tarea

    .patch('/:id', async ({ params, body, set }) => {
        const validation = validateUpdateTodo(body);
        if (!isValidId(params.id)) {
            set.status = 400;
            return {
                error: 'ID inválido',
                message: 'El ID proporcionado no es válido',
                timestamp: new Date().toISOString()
            };
        }
        if (!validation.success) {
            set.status = 400;
            return {
                error: 'Datos inválidos',
                message: 'Los datos proporcionados no son válidos',
                timestamp: new Date().toISOString()
            };
        }
        const updatedTodo = await Todo.findByIdAndUpdate(params.id, validation.data, { new: true });
        if (!updatedTodo) {
            set.status = 404;
            return {
                error: 'Tarea no encontrada',
                message: `No se encontró ninguna tarea con el ID: ${params.id}`,
                timestamp: new Date().toISOString()
            };
        }
        set.status = 200;
        return updatedTodo?.toJSON();
    })

    // Actualiza completamente una tarea

    .put('/:id', async ({ params, body, set }) => {
        const validacion = validateUpdateTodo(body);
        if (!isValidId(params.id)) {
            set.status = 400;
            return {
                error: 'ID inválido',
                message: 'El ID proporcionado no es válido',
                timestamp: new Date().toISOString()
            };
        }
        if (!validacion.success) {
            set.status = 400;
            return {
                error: 'Datos inválidos',
                message: 'Los datos proporcionados no son válidos',
                timestamp: new Date().toISOString()
            };
        }
        const updatedTodo = await Todo.findByIdAndUpdate(params.id, validacion.data, { new: true });
        if (!updatedTodo) {
            set.status = 404;
            return {
                error: 'Tarea no encontrada',
                message: `No se encontró ninguna tarea con el ID: ${params.id}`,
                timestamp: new Date().toISOString()
            };
        }
        set.status = 200;
        return updatedTodo;
    })

    // Elimina una tarea

    .delete('/:id', async ({ params, set }) => {
        if (!isValidId(params.id)) {
            set.status = 400;
            return {
                error: 'ID inválido',
                message: 'El ID proporcionado no es válido',
                timestamp: new Date().toISOString()
            };
        }
        const deletedTodo = await Todo.findByIdAndDelete(params.id);

        if (!deletedTodo) {
            set.status = 404;
            return {
                error: 'Tarea no encontrada',
                message: `No se encontró ninguna tarea con el ID: ${params.id}`,
                timestamp: new Date().toISOString()
            };
        }

        set.status = 204;
        return;
    });


//------------------------------------------------------------------------------