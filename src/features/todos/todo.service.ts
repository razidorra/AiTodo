import AppError from "../../shared/errors/app-error";
import type { Todo } from "../types/todo.types";
import * as todoRepository from "./todo.repository";
import { validateCreateTodo, validateUpdateTodo } from "./todo.validation";

export async function listTodos(): Promise<Todo[]> {
  return todoRepository.findAll();
}

export async function getTodoById(id: string): Promise<Todo> {
  const todo = await todoRepository.findById(id);

  if (!todo) {
    throw new AppError("Todo not found", 404);
  }

  return todo;
}

export async function createTodo(payload: unknown): Promise<Todo> {
  const data = validateCreateTodo(payload);
  return todoRepository.create(data);
}

export async function updateTodo(id: string, payload: unknown): Promise<Todo> {
  await getTodoById(id);

  const updates = validateUpdateTodo(payload);
  const todo = await todoRepository.update(id, updates);

  if (!todo) {
    throw new AppError("Todo not found", 404);
  }

  return todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const deleted = await todoRepository.remove(id);

  if (!deleted) {
    throw new AppError("Todo not found", 404);
  }
}
