import dotenv from "dotenv";

dotenv.config();
dotenv.config({
  path: "public/.env",
});

type Env = {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  clerkPublishableKey: string;
};

function requireEnvValue(value: string | undefined, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function createEnv(source: NodeJS.ProcessEnv): Env {
  return {
    port: Number(source.PORT) || 3000,
    nodeEnv: source.NODE_ENV || "development",
    mongodbUri: source.MONGODB_URI || "mongodb://127.0.0.1:27017/todoapp",
    jwtSecret: requireEnvValue(source.JWT_SECRET, "JWT_SECRET"),
    clerkPublishableKey: source.CLERK_PUBLISHABLE_KEY || source.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  };
}

const env = createEnv(process.env);

export default env;
