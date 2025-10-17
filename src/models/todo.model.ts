import { model } from "mongoose";
import { todoSchema, type TodoDocument } from "../schema/mongoDB.ts";
//model db de mongo usando el schema de mongoose

export const Todo = model<TodoDocument>('Todos', todoSchema);