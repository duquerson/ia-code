// Utilidades de errores personalizadas para la aplicación
// Estilo: clases ligeras que extienden Error y almacenan código y statusCode

class AppError extends Error {
    public code: string;
    public statusCode: number;
    public details?: unknown;

    constructor(code: string, message: string, statusCode = 500, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', details?: unknown) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}

class InvalidIdError extends AppError {
    constructor(message = 'Invalid identifier') {
        super('INVALID_ID', message, 400);
        this.name = 'InvalidIdError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database error', details?: unknown) {
        super('DATABASE_ERROR', message, 500, details);
        this.name = 'DatabaseError';
    }
}

class DuplicateError extends AppError {
    constructor(message = 'Duplicate resource') {
        super('DUPLICATE_ERROR', message, 409);
        this.name = 'DuplicateError';
    }
}

export {
    AppError,
    ValidationError,
    NotFoundError,
    InvalidIdError,
    DatabaseError,
    DuplicateError
};
