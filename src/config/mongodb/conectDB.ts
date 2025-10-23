import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../../utils/logger.ts';
dotenv.config({ path: '.env', quiet: true });
import { DATA } from '../../utils/const.ts';

//------------------------------------------------------------------------------
// Estado de la conexión
//------------------------------------------------------------------------------

let isConnected = false;


if (!DATA.URl) {
    logger.error('❌ La variable de entorno STRING_API_MONGODB no está configurada.');
    throw new Error('STRING_API_MONGODB environment variable is required');
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
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
        retryWrites: true,
        retryReads: true,
    };


    return mongoose.connect(DATA.URl, options)
        .then(() => {
            isConnected = true;
            logger.info('✅ MongoDB conectado exitosamente');
        })
        .catch((error) => {
            isConnected = false;
            logger.error('❌ Error conectando a MongoDB', {
                error: error instanceof Error ? error.message : error,
                mongodbUri: DATA.URl ? 'Configurada' : 'No configurada'
            });

            logger.error('Verifica:', {
                uri: 'La URI de MongoDB está correcta',
                network: 'Tienes conexión a internet',
                mongodb: 'El servidor MongoDB está activo'
            });


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
            logger.info('✅ Desconectado de MongoDB exitosamente');
        })
        .catch((error) => {
            logger.error('❌ Error desconectando de MongoDB', {
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

    logger.debug('Estado de conexión:', status);
    return status;
};

//------------------------------------------------------------------------------
// Eventos de conexión (opcional pero recomendado)
//------------------------------------------------------------------------------

mongoose.connection.on('connected', () => {
    logger.info('🔌 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (error) => {
    logger.error('❌ Error de conexión Mongoose:', { error: error.message });
});

mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ Mongoose desconectado de MongoDB');
    isConnected = false;
});

// Cerrar conexión al terminar el proceso
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        logger.info('🛑 Conexión cerrada por terminación de la app');
        // En lugar de process.exit, permitir que el proceso termine naturalmente
    } catch (error) {
        logger.error('Error cerrando conexión:', { error: error instanceof Error ? error.message : error });
        // En lugar de process.exit, permitir que el proceso termine naturalmente
    }
});