import { z, ZodError } from "zod";
import AppError from "../../shared/errors/app-error";
import type { CreateCollaboratorInput } from "../types/collaborator.types";
import { createCollaboratorSchema } from "./collaborator.schema";

function mapZodError(error: ZodError): AppError {
  const issue = error.issues[0];

  if (!issue) {
    return new AppError("Invalid request body", 400);
  }

  const field = issue.path[0];

  if (issue.code === "invalid_type" && field === "email") {
    return new AppError("Email must be a string", 400);
  }

  if (issue.code === "invalid_type" && field === "username") {
    return new AppError("Username must be a string", 400);
  }

  if (issue.code === "unrecognized_keys") {
    const key = issue.keys[0] || "Unknown field";
    return new AppError(`Field "${key}" is not allowed`, 400);
  }

  if (issue.code === "invalid_type") {
    return new AppError("Request body must be an object", 400);
  }

  return new AppError(issue.message, 400);
}

function parseSchema<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw mapZodError(result.error);
  }

  return result.data;
}

export function validateCreateCollaborator(payload: unknown): CreateCollaboratorInput {
  return parseSchema(createCollaboratorSchema, payload);
}
