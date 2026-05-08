class AppError extends Error {
  status: number;
  isOperational: boolean;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.isOperational = true;
  }
}

export default AppError;
