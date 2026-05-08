import { describe, expect, it } from "vitest";
import { validateLogin, validateRegister } from "../src/features/auth/auth.validation";
import { expectAppError } from "./test-utils";

describe("auth validation", () => {
  it("validates and normalizes register input", () => {
    const result = validateRegister({
      email: "  USER@Example.COM  ",
      password: "secret123",
    });

    expect(result).toEqual({
      email: "user@example.com",
      password: "secret123",
    });
  });

  it("rejects invalid register input", () => {
    expectAppError(() => validateRegister({ email: "not-an-email", password: "secret123" }), "Email must be valid", 400);
    expectAppError(() => validateRegister({ email: "user@example.com", password: "123" }), "Password must be at least 6 characters", 400);
  });

  it("validates and normalizes login input", () => {
    const result = validateLogin({
      email: "  USER@Example.COM  ",
      password: "secret123",
    });

    expect(result).toEqual({
      email: "user@example.com",
      password: "secret123",
    });
  });
});
