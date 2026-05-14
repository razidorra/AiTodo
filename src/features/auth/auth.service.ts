import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../config/setting";
import AppError from "../../shared/errors/app-error";
import type { AuthResponse, AuthUser, PublicUser } from "../types/auth.types";
import * as authRepository from "./auth.repository";
import { validateLogin, validateRegister } from "./auth.validation";

const passwordSaltRounds = 10;

function toPublicUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: "1h",
    },
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function register(payload: unknown): Promise<AuthResponse> {
  const data = validateRegister(payload);
  const existingUser = await authRepository.findByEmail(data.email);

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, passwordSaltRounds);
  let user: AuthUser;

  try {
    user = await authRepository.createUser(data.email, passwordHash);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError("Email already registered", 409);
    }

    throw error;
  }

  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}

export async function login(payload: unknown): Promise<AuthResponse> {
  const data = validateLogin(payload);
  const user = await authRepository.findByEmail(data.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}
