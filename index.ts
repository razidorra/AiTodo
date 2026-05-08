import app from "./src/app";
import env from "./src/config/setting";
import { connectDatabase, disconnectDatabase } from "./src/database/mongoose";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB");

    const server = app.listen(env.port, () => {
      console.log(`Todo API running on http://localhost:${env.port}`);
    });

    const shutdown = async (): Promise<void> => {
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown();
    });

    process.on("SIGTERM", () => {
      void shutdown();
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

void startServer();
