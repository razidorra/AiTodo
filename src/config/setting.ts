import "dotenv/config";

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todoapp",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
};

export default env;
