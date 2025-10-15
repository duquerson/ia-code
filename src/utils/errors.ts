/**
 * Clase de error personalizada que extiende Error nativo
 * Proporciona manejo de errores más específico y robusto
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly timestamp: Date;
    public readonly details?: Record<string, unknown>;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.timestamp = new Date();
        if (details) this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convierte el error a un objeto serializable para respuestas HTTP
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            timestamp: this.timestamp.toISOString(),
            ...(this.details && { details: this.details }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: this.stack
            })
        };
    }

    /**
     * Registra el error usando el sistema de logging
     */
    log() {
        // Importar logger dinámicamente para evitar dependencias circulares
        import('./logger.js').then(({ default: logger }) => {
            logger.error(this.message, {
                name: this.name,
                statusCode: this.statusCode,
                code: this.code,
                details: this.details
            });
        }).catch(() => {
            // Fallback si no se puede cargar el logger
            console.error('Error logging failed:', this.message);
        });
    }
}

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} con ID '${id}' no encontrado`
            : `${resource} no encontrado`;
        super(message, 404, 'NOT_FOUND');
    }
}

/**
 * Error de ID inválido (400)
 */
export class InvalidIdError extends AppError {
    constructor(id: string) {
        super(`ID inválido: '${id}'. Debe ser un ObjectId válido de MongoDB`, 400, 'INVALID_ID');
    }
}

/**
 * Error de base de datos (500)
 */
export class DatabaseError extends AppError {
    constructor(message: string, originalError?: Error) {
        super(message, 500, 'DATABASE_ERROR', { originalError: originalError?.message });
    }
}

/**
 * Error de duplicado (409)
 */
export class DuplicateError extends AppError {
    constructor(resource: string, field?: string) {
        const message = field
            ? `Ya existe un ${resource} con ese ${field}`
            : `${resource} duplicado`;
        super(message, 409, 'DUPLICATE_ERROR');
    }
}
