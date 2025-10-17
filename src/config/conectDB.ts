import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env', quiet: true });
//------------------------------------------------------------------------------

// Variables de entorno y configuración inicial
//------------------------------------------------------------------------------
export const DATA = {
    APIDB: process.env.STRING_API_MONGODB?.trim() || '',
    PORT: process.env.PORT ? Number(process.env.PORT) : 4321,
    HOST: process.env.HOST || 'localhost'
}
let isConnected = false;
const conectionString = process.env.STRING_API_MONGODB?.trim() || '';


if (!conectionString) {
    console.error('❌ La variable de entorno STRING_API_MONGODB no está configurada.');
    process.exit(1);
}
//------------------------------------------------------------------------------
// Conexión a MongoDB 
//------------------------------------------------------------------------------

export const connectDB = (): Promise<void> => {
    // Si ya está conectado, retornar
    if (isConnected) {
        console.debug('Ya existe una conexión activa a DB');
        return Promise.resolve();
    }

    // Opciones de conexión según documentación de Mongoose 8+
    const options = {
        maxPoolSize: 10,              // Pool de 10 conexiones
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
        retryWrites: true,
        retryReads: true,
    };

    // ✅ Conexión con promesas (estilo oficial)
    return mongoose.connect(conectionString, options)
        .then(() => {
            isConnected = true;

            console.info('✅ MongoDB conectado exitosamente', {
                database: mongoose.connection.name,
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                readyState: mongoose.connection.readyState
            });
        })
        .catch((error) => {
            isConnected = false;
            console.error('❌ Error conectando a MongoDB', {
                error: error instanceof Error ? error.message : error,
                mongodbUri: conectionString ? 'Configurada' : 'No configurada'
            });

            console.error('Verifica:', {
                uri: 'La URI de MongoDB está correcta',
                network: 'Tienes conexión a internet',
                mongodb: 'El servidor MongoDB está activo'
            });

            // Re-lanzar el error para que lo maneje quien llame a connectDB
            throw error;
        });
};

//------------------------------------------------------------------------------
// Desconectar de MongoDB
//------------------------------------------------------------------------------

export const disconnectDB = (): Promise<void> => {
    return mongoose.connection.close()
        .then(() => {
            isConnected = false;
            console.info('✅ Desconectado de MongoDB exitosamente');
        })
        .catch((error) => {
            console.error('❌ Error desconectando de MongoDB', {
                error: error instanceof Error ? error.message : error
            });
            throw error;
        });
};

//------------------------------------------------------------------------------
// Obtener estado de conexión
//------------------------------------------------------------------------------

export const getConnectionStatus = () => {
    const status = {
        isConnected,
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name || 'Sin conexión',
        host: mongoose.connection.host || 'N/A',
        port: mongoose.connection.port || 'N/A',
    };

    console.debug('Estado de conexión:', status);
    return status;
};

//------------------------------------------------------------------------------
// Eventos de conexión (opcional pero recomendado)
//------------------------------------------------------------------------------

mongoose.connection.on('connected', () => {
    console.info('🔌 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ Error de conexión Mongoose:', { error });
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose desconectado de MongoDB');
    isConnected = false;
});

// Cerrar conexión al terminar el proceso
process.on('SIGINT', () => {
    mongoose.connection.close()
        .then(() => {
            console.info('🛑 Conexión cerrada por terminación de la app');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error cerrando conexión:', error);
            process.exit(1);
        });
});