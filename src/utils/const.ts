export const DATA = {
    URl: process.env.STRING_API_MONGODB?.trim() || '',
    PORT: process.env.PORT ? Number(process.env.PORT) : 4321,
    HOST: process.env.HOST || 'localhost'
};