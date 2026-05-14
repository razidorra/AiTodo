import { describe, expect, it } from "vitest";
import { createEnv } from "../src/config/setting";

describe("settings config", () => {
  it("requires JWT_SECRET instead of using a hardcoded fallback", () => {
    expect(() =>
      createEnv({
        PORT: "3000",
        NODE_ENV: "test",
        MONGODB_URI: "mongodb://127.0.0.1:27017/todoapp",
      }),
    ).toThrow("JWT_SECRET is required");
  });

  it("uses the provided JWT_SECRET", () => {
    const env = createEnv({
      PORT: "4000",
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://127.0.0.1:27017/todoapp-test",
      JWT_SECRET: "test-secret",
    });

    expect(env).toEqual({
      port: 4000,
      nodeEnv: "test",
      mongodbUri: "mongodb://127.0.0.1:27017/todoapp-test",
      jwtSecret: "test-secret",
      clerkPublishableKey: "",
    });
  });

  it("reads the Clerk publishable key when configured", () => {
    const env = createEnv({
      JWT_SECRET: "test-secret",
      CLERK_PUBLISHABLE_KEY: "pk_test_example",
    });

    expect(env.clerkPublishableKey).toBe("pk_test_example");
  });

  it("accepts NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for Clerk frontend config", () => {
    const env = createEnv({
      JWT_SECRET: "test-secret",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_frontend_example",
    });

    expect(env.clerkPublishableKey).toBe("pk_test_frontend_example");
  });
});
