import { Schema, Types } from "mongoose";
import logger from "../utils/logger.js";

type SchemaNote = {
    content: string;
    date: Date;
    important: boolean;
    userId?: string; // Para futuras funcionalidades multi-usuario
    tags?: string[]; // Para categorización
    createdAt?: Date; // Campo agregado automáticamente por timestamps: true
    updatedAt?: Date; // Campo agregado automáticamente por timestamps: true
}

type NoteDocument = {
    id?: string;
    _id?: Types.ObjectId;
    __v?: number;
    createdAt?: Date;
    updatedAt?: Date;
} & SchemaNote

// Tipo para la respuesta API simplificada
type NoteResponse = {
    id: string;
    content: string;
    date: Date;
    timestamp?: Date;
    important: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Función para validar contenido de nota
const validateContent = function (content: string): boolean {
    if (!content || typeof content !== 'string') return false;

    // Validar longitud
    if (content.length < 1 || content.length > 2000) return false;

    // Validar que no sea solo espacios en blanco
    if (content.trim().length === 0) return false;

    return true;
};

// Función para validar fecha - más permisiva y práctica
const validateDate = function (date: Date): boolean {
    // Validación básica: debe ser una instancia de Date válida
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return false;
    }

    // Solo rechazar fechas muy futuras (más de 1 año en el futuro)
    // para permitir notas programadas con anticipación razonable
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    if (date > oneYearFromNow) return false;

    // Solo rechazar fechas muy antiguas (más de 50 años atrás)
    // para permitir notas históricas
    const fiftyYearsAgo = new Date(Date.now() - 50 * 365 * 24 * 60 * 60 * 1000);
    if (date < fiftyYearsAgo) return false;

    return true;
};

export const noteSchema = new Schema<SchemaNote>({
    content: {
        type: String,
        required: [true, 'El contenido es obligatorio'],
        validate: {
            validator: validateContent,
            message: 'El contenido debe tener entre 1 y 2000 caracteres y no puede estar vacío'
        },
        trim: true,
        maxlength: [2000, 'El contenido no puede exceder los 2000 caracteres']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        validate: {
            validator: validateDate,
            message: 'La fecha debe ser válida (no más de 1 año en el futuro ni más de 50 años en el pasado)'
        },
        default: Date.now
    },
    important: {
        type: Boolean,
        required: true,
        default: false
    },
    userId: {
        type: String,
        required: false,
        index: true // Para futuras consultas por usuario
    },
    tags: {
        type: [String],
        required: false,
        default: [],
        validate: {
            validator: function (tags: string[]): boolean {
                if (!Array.isArray(tags)) return false;
                if (tags.length > 10) return false; // Máximo 10 tags

                // Validar cada tag
                for (const tag of tags) {
                    if (typeof tag !== 'string' || tag.length > 30) return false;
                    if (tag.trim().length === 0) return false;
                }

                return true;
            },
            message: 'Los tags deben ser máximo 10, cada uno con máximo 30 caracteres'
        }
    }
},
    {
        timestamps: true,
        // Opciones de optimización
        strict: true, // Rechazar campos no definidos en el esquema
        minimize: false, // Incluir campos con valores por defecto en las consultas
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

// Índices para optimizar consultas comunes
noteSchema.index({ date: -1 }); // Índice descendente para ordenar por fecha más reciente primero
noteSchema.index({ important: 1, date: -1 }); // Índice compuesto para filtrar notas importantes
noteSchema.index({ userId: 1, date: -1 }); // Índice para futuras consultas por usuario
noteSchema.index({ tags: 1 }); // Índice para búsquedas por tags
// ❌ REMOVED: Índice de texto deprecated en Mongoose 7+ - usar Atlas Search o plugin separado si es necesario

// Virtual para obtener la longitud del contenido
noteSchema.virtual('contentLength').get(function () {
    return this.content ? this.content.length : 0;
});

// Virtual para obtener si la nota es reciente (últimas 24 horas)
noteSchema.virtual('isRecent').get(function () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.date > oneDayAgo;
});

// Método estático para buscar notas por importancia
noteSchema.statics.findByImportance = function (important: boolean) {
    return this.find({ important }).sort({ date: -1 });
};

// Método estático para buscar notas recientes
noteSchema.statics.findRecent = function (limit = 10) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.find({ date: { $gte: oneDayAgo } }).sort({ date: -1 }).limit(limit);
};

// Middleware pre-save para sanitización adicional
noteSchema.pre('save', function (next) {
    // Sanitizar contenido: eliminar espacios múltiples y saltos de línea excesivos
    if (this.content) {
        this.content = this.content
            .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
            .replace(/\n\s*\n/g, '\n') // Reemplazar múltiples saltos de línea con uno solo
            .trim();
    }

    // Normalizar tags: eliminar duplicados y espacios
    if (this.tags && Array.isArray(this.tags)) {
        this.tags = [...new Set(this.tags.map(tag => tag.trim().toLowerCase()))];
    }

    next();
});

// Middleware post-save para logging usando el sistema de logging
noteSchema.post('save', function (doc) {
    // ✅ Usar sistema de logging en lugar de console.log directo
    logger.debug('Nota guardada exitosamente', {
        id: doc._id,
        contentPreview: doc.content.substring(0, 50) + '...',
        important: doc.important,
        date: doc.date
    });
});

// Transformación toJSON simplificada - solo campos requeridos
noteSchema.set('toJSON', {
    transform: (document, returnedObject: NoteDocument): NoteResponse => {
        // Crear objeto con solo los campos requeridos
        const result: NoteResponse = {
            id: returnedObject._id?.toString() || '',
            content: returnedObject.content,
            date: returnedObject.date,
            important: returnedObject.important ?? false, // ✅ Asegurar valor por defecto
            // Incluir campos de timestamp directamente
            ...(returnedObject.createdAt && { createdAt: returnedObject.createdAt }),
            ...(returnedObject.updatedAt && { updatedAt: returnedObject.updatedAt })
        };

        // Agregar timestamp - usar createdAt, updatedAt o fecha actual
        if (returnedObject.createdAt) {
            result.timestamp = returnedObject.createdAt;
        } else if (returnedObject.updatedAt) {
            result.timestamp = returnedObject.updatedAt;
        } else {
            // Fallback: usar fecha actual si no hay timestamps disponibles
            result.timestamp = new Date();
        }

        return result;
    }
});