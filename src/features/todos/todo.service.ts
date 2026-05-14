import AppError from "../../shared/errors/app-error";
import type { Todo } from "../types/todo.types";
import * as todoRepository from "./todo.repository";
import { validateCreateTodo, validateUpdateTodo } from "./todo.validation";

export async function listTodos(ownerKey: string): Promise<Todo[]> {
  return todoRepository.findAll(ownerKey);
}

export async function getTodoById(ownerKey: string, id: string): Promise<Todo> {
  const todo = await todoRepository.findById(ownerKey, id);

  if (!todo) {
    throw new AppError("Todo not found", 404);
  }

  return todo;
}

export async function createTodo(ownerKey: string, payload: unknown): Promise<Todo> {
  const data = validateCreateTodo(payload);
  return todoRepository.create(ownerKey, data);
}

export async function updateTodo(ownerKey: string, id: string, payload: unknown): Promise<Todo> {
  await getTodoById(ownerKey, id);

  const updates = validateUpdateTodo(payload);
  const todo = await todoRepository.update(ownerKey, id, updates);

  if (!todo) {
    throw new AppError("Todo not found", 404);
  }

  return todo;
}

export async function deleteTodo(ownerKey: string, id: string): Promise<void> {
  const deleted = await todoRepository.remove(ownerKey, id);

  if (!deleted) {
    throw new AppError("Todo not found", 404);
  }
}
