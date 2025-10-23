
//--------------------------------------------------------------------------
// Capa de Tipos de Schema - Interfaces para esquemas de BD
// Responsabilidades:
// - Definir contratos de datos para esquemas de Mongoose
// - Proporcionar tipado TypeScript para modelos de BD
// - Documentar estructura de datos en la base de datos
//--------------------------------------------------------------------------

export interface Itodo {
    id: string;
    description: string;
    completed: boolean;
}

//--------------------------------------------------------------------------