import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";
import type { Collaborator } from "../types/collaborator.types";

type CollaboratorFields = {
  ownerEmail: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CollaboratorDocument = HydratedDocument<CollaboratorFields>;

const collaboratorSchema = new Schema<CollaboratorFields>(
  {
    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

collaboratorSchema.index({ ownerEmail: 1, email: 1 }, { unique: true });

export const CollaboratorModel =
  (models.Collaborator as Model<CollaboratorFields> | undefined) ||
  model<CollaboratorFields>("Collaborator", collaboratorSchema);

export function toCollaborator(document: CollaboratorDocument): Collaborator {
  return {
    id: document.id,
    ownerEmail: document.ownerEmail,
    email: document.email,
    username: document.username,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
