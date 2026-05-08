import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app";
import { resetTodos } from "../src/features/todos/todo.repository";

describe("todo api", () => {
  beforeEach(async () => {
    await resetTodos();
  });

  it("returns the health status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
    });
  });

  it("creates and lists todos", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .send({
        title: "Build todo app",
        description: "Create first feature",
      })
      .expect(201);

    expect(createResponse.body.data.title).toBe("Build todo app");
    expect(createResponse.body.data.completed).toBe(false);

    const listResponse = await request(app).get("/api/todos").expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].id).toBe(createResponse.body.data.id);
  });

  it("gets a todo by id", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .send({
        title: "Read one todo",
        description: "Fetch by id",
      })
      .expect(201);

    const getResponse = await request(app).get(`/api/todos/${createResponse.body.data.id}`).expect(200);

    expect(getResponse.body.data).toEqual(createResponse.body.data);
  });

  it("returns not found for a missing todo", async () => {
    const response = await request(app).get("/api/todos/missing-id").expect(404);

    expect(response.body.error).toEqual({
      message: "Todo not found",
      status: 404,
    });
  });

  it("updates a todo", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .send({
        title: "First title",
      })
      .expect(201);

    const updateResponse = await request(app)
      .patch(`/api/todos/${createResponse.body.data.id}`)
      .send({
        title: "Updated title",
        completed: true,
      })
      .expect(200);

    expect(updateResponse.body.data.title).toBe("Updated title");
    expect(updateResponse.body.data.completed).toBe(true);
  });

  it("returns validation errors", async () => {
    const response = await request(app)
      .post("/api/todos")
      .send({
        title: "",
      })
      .expect(400);

    expect(response.body.error.message).toBe("Title is required");
  });

  it("returns validation errors for wrong field types", async () => {
    const titleResponse = await request(app)
      .post("/api/todos")
      .send({
        title: 123,
      })
      .expect(400);

    expect(titleResponse.body.error.message).toBe("Title must be a string");

    const createResponse = await request(app)
      .post("/api/todos")
      .send({
        title: "Validate update",
      })
      .expect(201);

    const completedResponse = await request(app)
      .patch(`/api/todos/${createResponse.body.data.id}`)
      .send({
        completed: "yes",
      })
      .expect(400);

    expect(completedResponse.body.error.message).toBe("Completed must be a boolean");
  });

  it("deletes a todo", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .send({
        title: "Delete me",
      })
      .expect(201);

    await request(app).delete(`/api/todos/${createResponse.body.data.id}`).expect(204);

    const getResponse = await request(app)
      .get(`/api/todos/${createResponse.body.data.id}`)
      .expect(404);

    expect(getResponse.body.error.message).toBe("Todo not found");
  });
});
