import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
    content: string;
    date: string;
    important: boolean;
}

const noteSchema = new Schema<INote>({
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    important: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model<INote>('Note', noteSchema);