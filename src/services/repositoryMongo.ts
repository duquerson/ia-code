import { model } from "mongoose";
;
import { TODO } from "../schema/schemaDB.ts";

const Todo = model('Todos', TODO);

export { Todo };