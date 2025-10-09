import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: './config.env', quiet: true });

export const PORT = Number(process.env.PORT) || 4321;
export const MONGODB_URI = process.env.MONGODB_URI || null;