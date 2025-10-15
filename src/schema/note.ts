import { Schema, Types } from "mongoose";
import { z } from "zod";
import logger from "../utils/logger.js";

type SchemaNote = {
    content: string;
    date: Date;
    important: boolean;
    userId?: string;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

type NoteDocument = {
    id?: string;
    _id?: Types.ObjectId;
    __v?: number;
    createdAt?: Date;
    updatedAt?: Date;
} & SchemaNote

// Esquemas Zod para validación robusta con safeParse
export const CreateNoteSchema = z.object({
    content: z.string()
        .min(1, "El contenido es obligatorio")
        .max(2000, "El contenido no puede exceder 2000 caracteres")
        .trim()
        .refine(content => content.length > 0, "El contenido no puede estar vacío"),
    date: z.string().datetime().optional().or(z.date().optional()),
    important: z.boolean().optional()
});

export const UpdateNoteSchema = z.object({
    content: z.string()
        .min(1, "El contenido es obligatorio")
        .max(2000, "El contenido no puede exceder 2000 caracteres")
        .trim()
        .refine(content => content.length > 0, "El contenido no puede estar vacío"),
    important: z.boolean().optional()
});

export const NoteIdSchema = z.string()
    .length(24, "El ID debe tener 24 caracteres")
    .regex(/^[0-9a-fA-F]{24}$/, "El ID debe ser un ObjectId válido de MongoDB");

// Función simplificada para validar contenido
const validateContent = (content: string): boolean => {
    return typeof content === 'string' && content.trim().length > 0 && content.length <= 2000;
};

// Función simplificada para validar fecha
const validateDate = (date: Date): boolean => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return false;

    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const fiftyYearsAgo = new Date(Date.now() - 50 * 365 * 24 * 60 * 60 * 1000);

    return date <= oneYearFromNow && date >= fiftyYearsAgo;
};

export const noteSchema = new Schema<SchemaNote>({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    important: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        index: true
    },
    tags: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Índices esenciales
noteSchema.index({ date: -1 });
noteSchema.index({ important: 1, date: -1 });