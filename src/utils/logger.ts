//------------------------------------------------
//objeto centralizado para mostrar logs en consola
//------------------------------------------------

export const logger = {
    info: (message: string, meta?: unknown) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] INFO: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, meta?: unknown) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message: string, meta?: unknown) => {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] WARN: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    debug: (message: string, meta?: unknown) => {
        const timestamp = new Date().toISOString();
        console.debug(`[${timestamp}] DEBUG: ${message}`, meta ? JSON.stringify(meta) : '');
    }
};