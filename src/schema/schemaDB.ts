import { Schema } from "mongoose";
import type { Itodo } from "../types/schema.d.ts";

//--------------------------------------------------------------------------
// Schema de Mongoose para la capa de Modelo (Model)
// Responsabilidades:
// - Definir estructura de datos en la base de datos
// - Validaciones de nivel de base de datos (última línea de defensa)
// - Transformaciones automáticas de datos (timestamps, _id -> id)
// - Índices y optimizaciones de BD
//
// Nota: Estas validaciones son redundantes con las de helpers/todo.ts
// pero necesarias porque:
// 1. Son la última línea de defensa contra datos corruptos
// 2. Se ejecutan en el servidor de BD (más seguras)
// 3. Proporcionan mensajes de error específicos de BD
//--------------------------------------------------------------------------

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
    }
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





