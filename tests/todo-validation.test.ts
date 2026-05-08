import { describe, expect, it } from "vitest";
import { validateCreateTodo, validateUpdateTodo } from "../src/features/todos/todo.validation";
import { expectAppError } from "./test-utils";

describe("todo validation", () => {
  it("validates and normalizes create todo input", () => {
    const result = validateCreateTodo({
      title: "  Learn tests  ",
      description: "  Cover validation  ",
    });

    expect(result).toEqual({
      title: "Learn tests",
      description: "Cover validation",
    });
  });

  it("uses an empty description when create input has no description", () => {
    const result = validateCreateTodo({
      title: "Learn defaults",
    });

    expect(result).toEqual({
      title: "Learn defaults",
      description: "",
    });
  });

  it("rejects invalid create todo input", () => {
    expectAppError(() => validateCreateTodo({ title: "" }), "Title is required", 400);
    expectAppError(() => validateCreateTodo({ title: 123 }), "Title must be a string", 400);
    expectAppError(() => validateCreateTodo(null), "Request body must be an object", 400);
  });

  it("validates update todo input", () => {
    const result = validateUpdateTodo({
      title: "  Updated title  ",
      completed: true,
    });

    expect(result).toEqual({
      title: "Updated title",
      completed: true,
    });
  });

  it("rejects invalid update todo input", () => {
    expectAppError(() => validateUpdateTodo({}), "At least one todo field is required", 400);
    expectAppError(() => validateUpdateTodo({ completed: "yes" }), "Completed must be a boolean", 400);
    expectAppError(() => validateUpdateTodo({ unknown: "field" }), "Field \"unknown\" is not allowed", 400);
  });
});
