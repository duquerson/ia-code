import { model } from 'mongoose';
import { noteSchema } from '../schema/note.ts';

export const Notes = model('Notes', noteSchema);

