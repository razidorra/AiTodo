import type { RequestHandler } from "express";
import AppError from "../errors/app-error";

const notFound: RequestHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

export default notFound;
