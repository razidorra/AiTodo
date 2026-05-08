import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const status = error.status || 500;
  const message = status === 500 ? "Internal server error" : error.message;

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};

export default errorHandler;
