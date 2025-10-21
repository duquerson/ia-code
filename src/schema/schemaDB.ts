import { Schema } from "mongoose";
import type { Itodo } from "../types/schema.d.ts";

//--------------------------------------------------------------------------

// Schema de mongoose

export const TODO = new Schema<Itodo>({

    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        minlength: [1, 'La descripción debe tener al menos 1 carácter'],
        maxlength: [2000, 'La descripción debe tener como máximo 2000 caracteres']
    },

    completed: {
        type: Boolean,
        default: false,
        required: true
    },

}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            if (ret._id) {
                ret.id = ret._id.toString();
                Reflect.deleteProperty(ret, '_id');
            }
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            Reflect.deleteProperty(ret, '_id');
            return ret;
        }
    }
});

//--------------------------------------------------------------------------

/// Índices esenciales para optimizar consultas frecuentes 

TODO.index({ completed: 1, createdAt: -1 });

//--------------------------------------------------------------------------



