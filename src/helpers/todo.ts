import { z } from "zod";

//--------------------------------------------------------------------------
// Helpers para validaciones transversales
// Responsabilidades:
// - Definir esquemas de validación reutilizables
// - Validar formato y estructura de datos de entrada/salida
// - No validar lógica de negocio (eso es del controlador)
//--------------------------------------------------------------------------


const baseDescriptionSchema = z.string()
    .min(1, "La descripción es obligatoria")
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .trim();

export const CreateTodoSchema = z.object({
    description: baseDescriptionSchema,
    completed: z.boolean().optional().default(false)
});

export const UpdateTodoSchema = z.object({
    description: baseDescriptionSchema.optional(),
    completed: z.boolean().optional()
}).refine(
    data => data.description !== undefined || data.completed !== undefined,
    "Debes proporcionar al menos un campo para actualizar"
);

export const TodoIdSchema = z.object({
    id: z.string().min(1, "El ID es obligatorio")
});

//--------------------------------------------------------------------------
// Tipos TypeScript derivados de los esquemas Zod

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type TodoIdInput = z.infer<typeof TodoIdSchema>;

//--------------------------------------------------------------------------
// Funciones de validación con tipos correctos

export const validateCreateTodo = (data: unknown) => {
    return CreateTodoSchema.safeParse(data);
}

export const validateUpdateTodo = (data: unknown) => {
    return UpdateTodoSchema.safeParse(data);
}

export const validateTodoId = (data: unknown) => {
    return TodoIdSchema.safeParse(data);
}

//--------------------------------------------------------------------------