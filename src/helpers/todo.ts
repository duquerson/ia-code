import { z } from "zod";
import { isObjectIdOrHexString } from "mongoose";
//--------------------------------------------------------------------------

// Esquemas Zod para validación robusta 

export const CreateTodoSchema = z.object({
    description: z.string()
        .min(1, "La descripción es obligatoria")
        .max(2000, "La descripción no puede exceder 2000 caracteres"),


    completed: z.boolean().optional().default(false)
});

export const UpdateTodoSchema = z.object({
    description: z.string()
        .min(1, "La descripción es obligatoria")
        .max(2000, "La descripción no puede exceder 2000 caracteres")
        .optional(),
    completed: z.boolean().optional()
}).refine(
    data => data.description !== undefined || data.completed !== undefined,
    "Debes proporcionar al menos un campo para actualizar"
);



//--------------------------------------------------------------------------

// Tipos TypeScript derivados de los esquemas Zod     

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;


//--------------------------------------------------------------------------
// Funciones de validación con tipos correctos

export const validateCreateTodo = (data: unknown) => {
    return CreateTodoSchema.safeParse(data);
}

export const validateUpdateTodo = (data: unknown) => {
    return UpdateTodoSchema.safeParse(data);
}

//--------------------------------------------------------------------------

// Función para validar IDs de MongoDB

export const isValidId = (id: string): boolean => {

    return isObjectIdOrHexString(id);
};

//--------------------------------------------------------------------------