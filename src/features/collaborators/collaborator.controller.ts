import type { RequestHandler } from "express";
import AppError from "../../shared/errors/app-error";
import * as collaboratorService from "./collaborator.service";

function getOwnerEmail(headerValue: string | string[] | undefined): string {
  const ownerEmail = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!ownerEmail || ownerEmail.trim() === "") {
    throw new AppError("Owner email is required", 401);
  }

  return ownerEmail.trim().toLowerCase();
}

export const listCollaborators: RequestHandler = async (req, res) => {
  res.json({
    data: await collaboratorService.listCollaborators(getOwnerEmail(req.headers["x-owner-email"])),
  });
};

export const addCollaborator: RequestHandler = async (req, res) => {
  res.status(201).json({
    data: await collaboratorService.addCollaborator(getOwnerEmail(req.headers["x-owner-email"]), req.body),
  });
};
