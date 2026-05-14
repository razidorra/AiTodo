import type { RequestHandler } from "express";
import AppError from "../../shared/errors/app-error";
import * as todoService from "./todo.service";

type TodoParams = {
  id: string;
};

function getTodoOwner(req: Parameters<RequestHandler>[0]): string {
  const ownerHeader = req.header("X-Todo-Owner")?.trim().toLowerCase();

  if (!ownerHeader) {
    throw new AppError("Todo owner is required", 400);
  }

  return ownerHeader;
}

export const listTodos: RequestHandler = async (req, res) => {
  res.json({
    data: await todoService.listTodos(getTodoOwner(req)),
  });
};

export const getTodo: RequestHandler<TodoParams> = async (req, res) => {
  res.json({
    data: await todoService.getTodoById(getTodoOwner(req), req.params.id),
  });
};

export const createTodo: RequestHandler = async (req, res) => {
  res.status(201).json({
    data: await todoService.createTodo(getTodoOwner(req), req.body),
  });
};

export const updateTodo: RequestHandler<TodoParams> = async (req, res) => {
  res.json({
    data: await todoService.updateTodo(getTodoOwner(req), req.params.id, req.body),
  });
};

export const deleteTodo: RequestHandler<TodoParams> = async (req, res) => {
  await todoService.deleteTodo(getTodoOwner(req), req.params.id);
  res.status(204).send();
};
