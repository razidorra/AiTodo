import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app";
import { resetTodos } from "../src/features/todos/todo.repository";

describe("todo api", () => {
  const todoOwner = "user:alice@example.com";

  beforeEach(async () => {
    await resetTodos();
  });

  it("returns the health status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
    });
  });

  it("serves the todo frontend", async () => {
    const response = await request(app).get("/").expect(200);

    expect(response.text).toContain("TodoFlow");
    expect(response.text).toContain("daisyui");
    expect(response.text).toContain("Team einladen");
    expect(response.text).toContain("Logout");
    expect(response.text).toContain("auth-nav.js");
    expect(response.text).toContain('type="module" src="./app.js"');
  });

  it("serves the Clerk login frontend", async () => {
    const response = await request(app).get("/login").expect(200);

    expect(response.text).toContain("Login");
    expect(response.text).toContain("clerk-auth.js");
    expect(response.text).toContain("Noch keinen Account");
    expect(response.text).toContain('type="module" src="./clerk-auth.js"');
  });

  it("uses current Clerk redirect options after login and registration", async () => {
    const loginScript = await request(app).get("/clerk-auth.js").expect(200);
    const registerScript = await request(app).get("/clerk-register.js").expect(200);

    expect(loginScript.text).toContain("forceRedirectUrl");
    expect(loginScript.text).toContain("fallbackRedirectUrl");
    expect(registerScript.text).toContain("forceRedirectUrl");
    expect(registerScript.text).toContain("fallbackRedirectUrl");
  });

  it("loads Clerk with UI components for mounted auth forms", async () => {
    const clerkClientScript = await request(app).get("/clerk-client.js").expect(200);

    expect(clerkClientScript.text).toContain("@clerk/ui@1/dist/ui.browser.js");
    expect(clerkClientScript.text).toContain("window.__internal_ClerkUICtor");
    expect(clerkClientScript.text).toContain("ui: { ClerkUI");
  });

  it("does not mention workspace collaborators on every task card", async () => {
    const appScript = await request(app).get("/app.js").expect(200);

    expect(appScript.text).not.toContain("createCollaboratorBadge");
    expect(appScript.text).not.toContain("collaborators.slice");
    expect(appScript.text).not.toContain("Keine Personen");
  });

  it("requires login before people can be added from the frontend", async () => {
    const response = await request(app).get("/").expect(200);
    const appScript = await request(app).get("/app.js").expect(200);

    expect(response.text).toContain("collaborator-locked-message");
    expect(response.text).toContain("collaborator-username-input");
    expect(appScript.text).toContain("createClerk");
    expect(appScript.text).toContain("setCollaboratorAccess");
    expect(appScript.text).toContain("collaboratorEmailInput.disabled = !canManage");
    expect(appScript.text).toContain("collaboratorUsernameInput.disabled = !canManage");
    expect(appScript.text).toContain("\"X-Owner-Email\": ownerEmail");
    expect(appScript.text).toContain("username: collaboratorUsernameInput.value");
  });

  it("supports separate guest todo lists from the frontend", async () => {
    const response = await request(app).get("/").expect(200);
    const appScript = await request(app).get("/app.js").expect(200);

    expect(response.text).toContain("guest-username-form");
    expect(response.text).toContain("guest-username-input");
    expect(appScript.text).toContain("todoOwner");
    expect(appScript.text).toContain("\"X-Todo-Owner\": todoOwner");
    expect(appScript.text).toContain("guest:");
    expect(appScript.text).toContain("localStorage");
  });

  it("does not expose collaborator email or id in the frontend team list", async () => {
    const appScript = await request(app).get("/app.js").expect(200);

    expect(appScript.text).not.toContain("ID ${collaborator.id}");
    expect(appScript.text).not.toContain("details.title = collaborator.email");
    expect(appScript.text).not.toContain("collaborator.email");
  });

  it("serves the Clerk register frontend", async () => {
    const response = await request(app).get("/register").expect(200);

    expect(response.text).toContain("Registrieren");
    expect(response.text).toContain("clerk-register.js");
    expect(response.text).toContain('type="module" src="./clerk-register.js"');
  });

  it("returns public client config without secrets", async () => {
    const response = await request(app).get("/api/client-config").expect(200);

    expect(response.body.data).toHaveProperty("clerkPublishableKey");
    expect(response.body.data).not.toHaveProperty("jwtSecret");
  });

  it("creates and lists todos", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: "Build todo app",
        description: "Create first feature",
      })
      .expect(201);

    expect(createResponse.body.data.title).toBe("Build todo app");
    expect(createResponse.body.data.completed).toBe(false);

    const listResponse = await request(app).get("/api/todos").set("X-Todo-Owner", todoOwner).expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].id).toBe(createResponse.body.data.id);
  });

  it("keeps todo lists separated by owner", async () => {
    await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", "user:alice@example.com")
      .send({
        title: "Alice todo",
      })
      .expect(201);

    await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", "guest:bob")
      .send({
        title: "Bob todo",
      })
      .expect(201);

    const aliceResponse = await request(app).get("/api/todos").set("X-Todo-Owner", "user:alice@example.com").expect(200);
    const bobResponse = await request(app).get("/api/todos").set("X-Todo-Owner", "guest:bob").expect(200);

    expect(aliceResponse.body.data).toHaveLength(1);
    expect(aliceResponse.body.data[0].title).toBe("Alice todo");
    expect(bobResponse.body.data).toHaveLength(1);
    expect(bobResponse.body.data[0].title).toBe("Bob todo");
  });

  it("gets a todo by id", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: "Read one todo",
        description: "Fetch by id",
      })
      .expect(201);

    const getResponse = await request(app).get(`/api/todos/${createResponse.body.data.id}`).set("X-Todo-Owner", todoOwner).expect(200);

    expect(getResponse.body.data).toEqual(createResponse.body.data);
  });

  it("returns not found for a missing todo", async () => {
    const response = await request(app).get("/api/todos/missing-id").set("X-Todo-Owner", todoOwner).expect(404);

    expect(response.body.error).toEqual({
      message: "Todo not found",
      status: 404,
    });
  });

  it("updates a todo", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: "First title",
      })
      .expect(201);

    const updateResponse = await request(app)
      .patch(`/api/todos/${createResponse.body.data.id}`)
      .set("X-Todo-Owner", todoOwner)
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
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: "",
      })
      .expect(400);

    expect(response.body.error.message).toBe("Title is required");
  });

  it("returns validation errors for wrong field types", async () => {
    const titleResponse = await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: 123,
      })
      .expect(400);

    expect(titleResponse.body.error.message).toBe("Title must be a string");

    const createResponse = await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: "Validate update",
      })
      .expect(201);

    const completedResponse = await request(app)
      .patch(`/api/todos/${createResponse.body.data.id}`)
      .set("X-Todo-Owner", todoOwner)
      .send({
        completed: "yes",
      })
      .expect(400);

    expect(completedResponse.body.error.message).toBe("Completed must be a boolean");
  });

  it("deletes a todo", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .set("X-Todo-Owner", todoOwner)
      .send({
        title: "Delete me",
      })
      .expect(201);

    await request(app).delete(`/api/todos/${createResponse.body.data.id}`).set("X-Todo-Owner", todoOwner).expect(204);

    const getResponse = await request(app)
      .get(`/api/todos/${createResponse.body.data.id}`)
      .set("X-Todo-Owner", todoOwner)
      .expect(404);

    expect(getResponse.body.error.message).toBe("Todo not found");
  });
});
