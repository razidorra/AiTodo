import { expect } from "vitest";
import AppError from "../src/shared/errors/app-error";

export function expectAppError(action: () => unknown, message: string, status: number): void {
  try {
    action();
    throw new Error("Expected AppError");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);

    if (error instanceof AppError) {
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
    }
  }
}

export async function expectAsyncAppError(
  action: () => Promise<unknown>,
  message: string,
  status: number,
): Promise<void> {
  try {
    await action();
    throw new Error("Expected AppError");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);

    if (error instanceof AppError) {
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
    }
  }
}
