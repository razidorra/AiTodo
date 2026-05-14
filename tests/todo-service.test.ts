import { beforeEach, describe, expect, it } from "vitest";
import { resetTodos } from "../src/features/todos/todo.repository";
import * as todoService from "../src/features/todos/todo.service";
import { expectAsyncAppError } from "./test-utils";

describe("todo service", () => {
  const ownerKey = "user:service@example.com";

  beforeEach(async () => {
    await resetTodos();
  });

  it("creates and lists todos", async () => {
    const todo = await todoService.createTodo(ownerKey, {
      title: "Service todo",
      description: "Created in service test",
    });

    expect(todo).toMatchObject({
      title: "Service todo",
      description: "Created in service test",
      completed: false,
    });
    expect(todo.id).toEqual(expect.any(String));
    expect(todo.createdAt).toEqual(expect.any(String));
    expect(todo.updatedAt).toEqual(expect.any(String));
    await expect(todoService.listTodos(ownerKey)).resolves.toEqual([todo]);
  });

  it("updates an existing todo", async () => {
    const todo = await todoService.createTodo(ownerKey, {
      title: "Before update",
    });

    const updatedTodo = await todoService.updateTodo(ownerKey, todo.id, {
      title: "After update",
      completed: true,
    });

    expect(updatedTodo).toMatchObject({
      id: todo.id,
      title: "After update",
      description: "",
      completed: true,
      createdAt: todo.createdAt,
    });
  });

  it("throws not found errors for missing todos", async () => {
    await expectAsyncAppError(() => todoService.getTodoById(ownerKey, "missing-id"), "Todo not found", 404);
    await expectAsyncAppError(
      () => todoService.updateTodo(ownerKey, "missing-id", { title: "No todo" }),
      "Todo not found",
      404,
    );
    await expectAsyncAppError(() => todoService.deleteTodo(ownerKey, "missing-id"), "Todo not found", 404);
  });

  it("deletes an existing todo", async () => {
    const todo = await todoService.createTodo(ownerKey, {
      title: "Delete from service",
    });

    await todoService.deleteTodo(ownerKey, todo.id);

    await expect(todoService.listTodos(ownerKey)).resolves.toEqual([]);
  });
});
