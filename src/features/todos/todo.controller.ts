import type { RequestHandler } from "express";
import * as todoService from "./todo.service";

type TodoParams = {
  id: string;
};

export const listTodos: RequestHandler = async (req, res) => {
  res.json({
    data: await todoService.listTodos(),
  });
};

export const getTodo: RequestHandler<TodoParams> = async (req, res) => {
  res.json({
    data: await todoService.getTodoById(req.params.id),
  });
};

export const createTodo: RequestHandler = async (req, res) => {
  res.status(201).json({
    data: await todoService.createTodo(req.body),
  });
};

export const updateTodo: RequestHandler<TodoParams> = async (req, res) => {
  res.json({
    data: await todoService.updateTodo(req.params.id, req.body),
  });
};

export const deleteTodo: RequestHandler<TodoParams> = async (req, res) => {
  await todoService.deleteTodo(req.params.id);
  res.status(204).send();
};
