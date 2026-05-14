import AppError from "../../shared/errors/app-error";
import type { Collaborator } from "../types/collaborator.types";
import * as collaboratorRepository from "./collaborator.repository";
import { validateCreateCollaborator } from "./collaborator.validation";

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function listCollaborators(ownerEmail: string): Promise<Collaborator[]> {
  return collaboratorRepository.findAll(ownerEmail);
}

export async function addCollaborator(ownerEmail: string, payload: unknown): Promise<Collaborator> {
  const data = validateCreateCollaborator(payload);
  const existingCollaborator = await collaboratorRepository.findByEmail(ownerEmail, data.email);

  if (existingCollaborator) {
    throw new AppError("Collaborator email already added", 409);
  }

  try {
    return await collaboratorRepository.create(ownerEmail, data.email, data.username);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError("Collaborator email already added", 409);
    }

    throw error;
  }
}
