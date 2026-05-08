import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import type { AuthUser } from "../types/auth.types";
import { AuthUserModel, toAuthUser } from "./auth.model";

let users: AuthUser[] = [];

function now(): string {
  return new Date().toISOString();
}

function hasDatabaseConnection(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function findByEmail(email: string): Promise<AuthUser | null> {
  if (hasDatabaseConnection()) {
    const document = await AuthUserModel.findOne({ email });
    return document ? toAuthUser(document) : null;
  }

  return users.find((user) => user.email === email) || null;
}

export async function createUser(email: string, passwordHash: string): Promise<AuthUser> {
  if (hasDatabaseConnection()) {
    const document = await AuthUserModel.create({
      email,
      passwordHash,
    });

    return toAuthUser(document);
  }

  const timestamp = now();
  const user: AuthUser = {
    id: randomUUID(),
    email,
    passwordHash,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  users.push(user);
  return user;
}

export async function resetUsers(): Promise<void> {
  if (hasDatabaseConnection()) {
    await AuthUserModel.deleteMany({});
  }

  users = [];
}
