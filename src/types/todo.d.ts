//--------------------------------------------------------------------------
// Capa de Tipos (Types) - Definiciones de datos
// Responsabilidades:
// - Definir contratos de datos para TypeScript
// - Documentar estructura de datos esperada
// - No realizar validaciones (solo tipado)
//--------------------------------------------------------------------------

export type todo = {
    description?: string;
    completed?: boolean;
}

export type todoResponse = {
    id: string;
    description: string;
    completed: boolean;
}