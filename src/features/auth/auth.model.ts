import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";
import type { AuthUser } from "../types/auth.types";

type AuthUserFields = {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUserDocument = HydratedDocument<AuthUserFields>;

const authUserSchema = new Schema<AuthUserFields>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AuthUserModel =
  (models.AuthUser as Model<AuthUserFields> | undefined) || model<AuthUserFields>("AuthUser", authUserSchema);

export function toAuthUser(document: AuthUserDocument): AuthUser {
  return {
    id: document.id,
    email: document.email,
    passwordHash: document.passwordHash,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
