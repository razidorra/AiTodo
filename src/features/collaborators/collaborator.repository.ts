import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import type { Collaborator } from "../types/collaborator.types";
import { CollaboratorModel, toCollaborator } from "./collaborator.model";

let collaborators: Collaborator[] = [];

function now(): string {
  return new Date().toISOString();
}

function hasDatabaseConnection(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function findAll(ownerEmail: string): Promise<Collaborator[]> {
  if (hasDatabaseConnection()) {
    const documents = await CollaboratorModel.find({ ownerEmail }).sort({ createdAt: 1 });
    return documents.map(toCollaborator);
  }

  return collaborators.filter((collaborator) => collaborator.ownerEmail === ownerEmail);
}

export async function findByEmail(ownerEmail: string, email: string): Promise<Collaborator | null> {
  if (hasDatabaseConnection()) {
    const document = await CollaboratorModel.findOne({ ownerEmail, email });
    return document ? toCollaborator(document) : null;
  }

  return collaborators.find((collaborator) => collaborator.ownerEmail === ownerEmail && collaborator.email === email) || null;
}

export async function create(ownerEmail: string, email: string, username: string): Promise<Collaborator> {
  if (hasDatabaseConnection()) {
    const document = await CollaboratorModel.create({
      ownerEmail,
      email,
      username,
    });

    return toCollaborator(document);
  }

  const timestamp = now();
  const collaborator: Collaborator = {
    id: randomUUID(),
    ownerEmail,
    email,
    username,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  collaborators.push(collaborator);
  return collaborator;
}

export async function resetCollaborators(): Promise<void> {
  if (hasDatabaseConnection()) {
    await CollaboratorModel.deleteMany({});
  }

  collaborators = [];
}
