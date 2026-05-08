import { beforeEach, describe, expect, it } from "vitest";
import { resetUsers } from "../src/features/auth/auth.repository";
import * as authService from "../src/features/auth/auth.service";
import { expectAsyncAppError } from "./test-utils";

describe("auth service", () => {
  beforeEach(async () => {
    await resetUsers();
  });

  it("registers a new user", async () => {
    const result = await authService.register({
      email: "user@example.com",
      password: "secret123",
    });

    expect(result.user).toMatchObject({
      email: "user@example.com",
    });
    expect(result.user.id).toEqual(expect.any(String));
    expect(result.user.createdAt).toEqual(expect.any(String));
    expect(result.user.updatedAt).toEqual(expect.any(String));
    expect(result).not.toHaveProperty("passwordHash");
    expect(result.token).toEqual(expect.any(String));
  });

  it("rejects duplicate email registration", async () => {
    await authService.register({
      email: "user@example.com",
      password: "secret123",
    });

    await expectAsyncAppError(
      () =>
        authService.register({
          email: "user@example.com",
          password: "secret123",
        }),
      "Email already registered",
      409,
    );
  });

  it("logs in with valid credentials", async () => {
    await authService.register({
      email: "user@example.com",
      password: "secret123",
    });

    const result = await authService.login({
      email: "user@example.com",
      password: "secret123",
    });

    expect(result.user.email).toBe("user@example.com");
    expect(result.token).toEqual(expect.any(String));
  });

  it("rejects invalid login credentials", async () => {
    await authService.register({
      email: "user@example.com",
      password: "secret123",
    });

    await expectAsyncAppError(
      () =>
        authService.login({
          email: "user@example.com",
          password: "wrong-password",
        }),
      "Invalid email or password",
      401,
    );
  });
});
