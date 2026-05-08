import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "../types/todo.types";
import { TodoModel, toTodo } from "./todo.model";

let todos: Todo[] = [];

function now(): string {
  return new Date().toISOString();
}

function hasDatabaseConnection(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function findAll(): Promise<Todo[]> {
  if (hasDatabaseConnection()) {
    const documents = await TodoModel.find().sort({ createdAt: 1 });
    return documents.map(toTodo);
  }

  return todos;
}

export async function findById(id: string): Promise<Todo | null> {
  if (hasDatabaseConnection()) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const document = await TodoModel.findById(id);
    return document ? toTodo(document) : null;
  }

  return todos.find((todo) => todo.id === id) || null;
}

export async function create(data: CreateTodoInput): Promise<Todo> {
  if (hasDatabaseConnection()) {
    const document = await TodoModel.create(data);
    return toTodo(document);
  }

  const timestamp = now();
  const todo: Todo = {
    id: randomUUID(),
    title: data.title,
    description: data.description,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  todos.push(todo);
  return todo;
}

export async function update(id: string, updates: UpdateTodoInput): Promise<Todo | null> {
  if (hasDatabaseConnection()) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const document = await TodoModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return document ? toTodo(document) : null;
  }

  const todo = todos.find((currentTodo) => currentTodo.id === id) || null;

  if (!todo) {
    return null;
  }

  Object.assign(todo, updates, {
    updatedAt: now(),
  });

  return todo;
}

export async function remove(id: string): Promise<boolean> {
  if (hasDatabaseConnection()) {
    if (!mongoose.isValidObjectId(id)) {
      return false;
    }

    const document = await TodoModel.findByIdAndDelete(id);
    return Boolean(document);
  }

  const initialLength = todos.length;
  todos = todos.filter((todo) => todo.id !== id);

  return todos.length !== initialLength;
}

export async function resetTodos(): Promise<void> {
  if (hasDatabaseConnection()) {
    await TodoModel.deleteMany({});
  }

  todos = [];
}
