import mongoose from 'mongoose';
import { MONGODB_URI } from '../config.ts';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
    if (isConnected) {
        console.log('Ya existe una conexión a MongoDB');
        return;
    }

    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI no está definida en las variables de entorno');
        }
        
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('✅ MongoDB conectado exitosamente');

    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose conectado a MongoDB');
    isConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de conexión MongoDB:', err);
    isConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose desconectado de MongoDB');
    isConnected = false;
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 Conexión a MongoDB cerrada por terminación de la aplicación');
    process.exit(0);
});

export default mongoose;