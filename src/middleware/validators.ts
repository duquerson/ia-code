/**
 * Validadores reutilizables
 * Contiene funciones de validación que se usan en múltiples lugares
 */

import mongoose from 'mongoose';
import { InvalidIdError } from '../utils/errors.ts';

/**
 * Valida si un string es un ObjectId válido de MongoDB
 * 
 * @param id - String a validar
 * @returns true si es válido, false si no
 * 
 * @example
 * isValidObjectId('507f1f77bcf86cd799439011') // true
 * isValidObjectId('abc123') // false
 */
export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valida y lanza error si el ID no es válido
 * Útil para uso en funciones que necesitan IDs válidos
 * 
 * @param id - ID a validar
 * @throws {InvalidIdError} Si el ID no es válido
 * 
 * @example
 * validateObjectId('507f1f77bcf86cd799439011') // ✅ No lanza error
 * validateObjectId('abc123') // ❌ Lanza InvalidIdError
 */
export const validateObjectId = (id: string): void => {
    if (!isValidObjectId(id)) {
        throw new InvalidIdError(id);
    }
};

/**
 * Valida contenido de nota
 * 
 * @param content - Contenido a validar
 * @returns true si es válido
 */
export const isValidContent = (content: string): boolean => {
    return typeof content === 'string' && content.trim().length > 0 && content.length <= 2000;
};

/**
 * Valida fecha
 * 
 * @param date - Fecha a validar (string o Date)
 * @returns true si es válida
 */
export const isValidDate = (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
};
