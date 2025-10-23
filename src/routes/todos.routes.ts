
import { Elysia } from 'elysia';
import { CreateTodoSchema, UpdateTodoSchema, TodoIdSchema } from '../helpers/todo.ts';
import { todoController } from '../controllers/todos.controller.ts';

//------------------------------------------------------------------------------
// Capa de Rutas (Routes) - Middleware de presentación
// Responsabilidades:
// - Definir endpoints HTTP y métodos
// - Validar parámetros de ruta y cuerpo usando esquemas Zod
// - Transformar respuestas HTTP (códigos de estado, formato)
// - No contiene lógica de negocio (delegada al controlador)
// - No maneja errores (delegado al middleware global)
//------------------------------------------------------------------------------

export const todosRoutes = new Elysia({ prefix: '/api/v1/todos' })
    //------------------------------------------------------------------------------
    //obtiene todas las tareas
    //------------------------------------------------------------------------------    
    .get('/', async ({ set }) => {
        const todos = await todoController.getAllTodos();
        set.status = 200;
        return {
            success: true,
            data: todos
        }
    })
    //------------------------------------------------------------------------------
    //obtiene una tarea por id
    //------------------------------------------------------------------------------
    .get('/:id', async ({ params, set }) => {
        const { id } = params;
        const todo = await todoController.getTodoById(id);
        set.status = 200;
        return {
            success: true,
            data: todo
        }
    }, {
        params: TodoIdSchema
    })
    //------------------------------------------------------------------------------
    //crea una nueva tarea
    //------------------------------------------------------------------------------
    .post('/', async ({ body, set }) => {
        const todo = await todoController.createTodo(body);
        set.status = 201;
        return {
            success: true,
            data: todo
        }
    }, {
        body: CreateTodoSchema
    })
    //------------------------------------------------------------------------------
    // Actualiza sparcialmente una tarea
    //------------------------------------------------------------------------------
    .patch('/:id', async ({ params, body, set }) => {
        const { id } = params;
        const todo = await todoController.updateTodo(id, body);
        set.status = 200;
        return {
            success: true,
            data: todo
        }
    }, {
        body: UpdateTodoSchema,
        params: TodoIdSchema
    })
    //------------------------------------------------------------------------------
    // Actualiza completamente una tarea
    //------------------------------------------------------------------------------
    .put('/:id', async ({ params, set, body }) => {
        const { id } = params;
        let { status } = set;
        const todo = await todoController.updateTodo(id, body);
        status = 200;
        return {
            success: true,
            data: todo
        }
    }, {
        body: UpdateTodoSchema,
        params: TodoIdSchema
    })
    //------------------------------------------------------------------------------
    // Elimina una tarea
    //------------------------------------------------------------------------------
    .delete('/:id', async ({ params, set }) => {
        const { id } = params;
        const result = await todoController.deleteTodo(id);
        set.status = 200;
        return {
            success: true,
            data: result
        }
    }, {
        params: TodoIdSchema
    });

//------------------------------------------------------------------------------