import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";
import type { Todo } from "../types/todo.types";

type TodoFields = {
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoDocument = HydratedDocument<TodoFields>;

const todoMongooseSchema = new Schema<TodoFields>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const TodoModel =
  (models.Todo as Model<TodoFields> | undefined) || model<TodoFields>("Todo", todoMongooseSchema);

export function toTodo(document: TodoDocument): Todo {
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    completed: document.completed,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
