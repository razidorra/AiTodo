import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import env from "./config/setting";
import authRoutes from "./features/auth/auth.routes";
import collaboratorRoutes from "./features/collaborators/collaborator.routes";
import todoRoutes from "./features/todos/todo.routes";
import errorHandler from "./shared/middleware/error-handler";
import notFound from "./shared/middleware/not-found";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https:", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["https:"],
        imgSrc: ["'self'", "data:", "https:"],
        workerSrc: ["'self'", "blob:"], // ← das fehlte!
        childSrc: ["'self'", "blob:"], // ← das auch
      },
    },
  }),
);
app.use(cors());
app.use(express.json());

app.get("/login", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "register.html"));
});

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/api/client-config", (req, res) => {
  res.json({
    data: {
      clerkPublishableKey: env.clerkPublishableKey,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/collaborators", collaboratorRoutes);
app.use("/api/todos", todoRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
