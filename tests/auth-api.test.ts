import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app";
import { resetUsers } from "../src/features/auth/auth.repository";

describe("auth api", () => {
  beforeEach(async () => {
    await resetUsers();
  });

  it("registers a user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "USER@example.com",
        password: "secret123",
      })
      .expect(201);

    expect(response.body.data.user.email).toBe("user@example.com");
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it("rejects duplicate registration", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "user@example.com",
        password: "secret123",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "user@example.com",
        password: "secret123",
      })
      .expect(409);

    expect(response.body.error.message).toBe("Email already registered");
  });

  it("logs in a user", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "user@example.com",
        password: "secret123",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user@example.com",
        password: "secret123",
      })
      .expect(200);

    expect(response.body.data.user.email).toBe("user@example.com");
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it("returns validation errors", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "not-an-email",
        password: "123",
      })
      .expect(400);

    expect(response.body.error.message).toBe("Email must be valid");
  });
});
