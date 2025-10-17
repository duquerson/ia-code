import { Schema, Types } from "mongoose";

//--------------------------------------------------------------------------

//type para el schema de mongoose

export type SchemaTodo = {
    description: string;
    completed: boolean;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;

}

export type TodoDocument = {
    id?: string;
    _id?: Types.ObjectId;
    __v?: number;
    createdAt?: Date;
    updatedAt?: Date;

} & SchemaTodo

//--------------------------------------------------------------------------

// Schema de mongoose

export const todoSchema = new Schema<SchemaTodo>({
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },

    completed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        index: true
    },


}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret: Partial<TodoDocument>) => {
            ret.id = ret._id?.toString() ?? '';
            delete ret._id
            delete ret.__v
            return ret
        }
    }
});

//--------------------------------------------------------------------------

/// Índices esenciales para optimizar consultas frecuentes 

todoSchema.index({ completed: 1, createdAt: -1 });

//--------------------------------------------------------------------------



