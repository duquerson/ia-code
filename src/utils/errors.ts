//----------------------------------------------
// Errors Personalizados para la aplicación
//--------------------------------------------------------------

class AppError extends Error {
    public status: number;
    public code: string;
    constructor(message: string, code = 'APP_ERROR', status = 500) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    public details?: unknown;
    constructor(message = 'Validation error', details?: unknown) {
        super(message, 'VALIDATION_ERROR', 400);
        this.details = details;
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Not found') {
        super(message, 'NOT_FOUND', 404);
    }
}

class ClientError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 'CLIENT_ERROR', 400);
    }
}

class ServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 'SERVER_ERROR', 500);
    }
}
//--------------------------------------------------------------

export { AppError, ValidationError, NotFoundError, ClientError, ServerError };