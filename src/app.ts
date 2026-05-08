import cors from "cors";
import express from "express";
import helmet from "helmet";
import authRoutes from "./features/auth/auth.routes";
import todoRoutes from "./features/todos/todo.routes";
import errorHandler from "./shared/middleware/error-handler";
import notFound from "./shared/middleware/not-found";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
