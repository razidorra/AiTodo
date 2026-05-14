import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "../types/todo.types";
import { TodoModel, toTodo } from "./todo.model";

type StoredTodo = Todo & {
  ownerKey: string;
};

let todos: StoredTodo[] = [];

function now(): string {
  return new Date().toISOString();
}

function hasDatabaseConnection(): boolean {
  return mongoose.connection.readyState === 1;
}

function toPublicTodo(todo: StoredTodo): Todo {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

export async function findAll(ownerKey: string): Promise<Todo[]> {
  if (hasDatabaseConnection()) {
    const documents = await TodoModel.find({ ownerKey }).sort({ createdAt: 1 });
    return documents.map(toTodo);
  }

  return todos.filter((todo) => todo.ownerKey === ownerKey).map(toPublicTodo);
}

export async function findById(ownerKey: string, id: string): Promise<Todo | null> {
  if (hasDatabaseConnection()) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const document = await TodoModel.findOne({ _id: id, ownerKey });
    return document ? toTodo(document) : null;
  }

  const todo = todos.find((currentTodo) => currentTodo.ownerKey === ownerKey && currentTodo.id === id);
  return todo ? toPublicTodo(todo) : null;
}

export async function create(ownerKey: string, data: CreateTodoInput): Promise<Todo> {
  if (hasDatabaseConnection()) {
    const document = await TodoModel.create({
      ...data,
      ownerKey,
    });
    return toTodo(document);
  }

  const timestamp = now();
  const todo: StoredTodo = {
    id: randomUUID(),
    ownerKey,
    title: data.title,
    description: data.description,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  todos.push(todo);
  return toPublicTodo(todo);
}

export async function update(ownerKey: string, id: string, updates: UpdateTodoInput): Promise<Todo | null> {
  if (hasDatabaseConnection()) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const document = await TodoModel.findOneAndUpdate({ _id: id, ownerKey }, updates, {
      new: true,
      runValidators: true,
    });

    return document ? toTodo(document) : null;
  }

  const todo = todos.find((currentTodo) => currentTodo.ownerKey === ownerKey && currentTodo.id === id) || null;

  if (!todo) {
    return null;
  }

  Object.assign(todo, updates, {
    updatedAt: now(),
  });

  return toPublicTodo(todo);
}

export async function remove(ownerKey: string, id: string): Promise<boolean> {
  if (hasDatabaseConnection()) {
    if (!mongoose.isValidObjectId(id)) {
      return false;
    }

    const document = await TodoModel.findOneAndDelete({ _id: id, ownerKey });
    return Boolean(document);
  }

  const initialLength = todos.length;
  todos = todos.filter((todo) => todo.ownerKey !== ownerKey || todo.id !== id);

  return todos.length !== initialLength;
}

export async function resetTodos(): Promise<void> {
  if (hasDatabaseConnection()) {
    await TodoModel.deleteMany({});
  }

  todos = [];
}
