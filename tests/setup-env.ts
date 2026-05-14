import { randomUUID } from "node:crypto";

process.env.JWT_SECRET ||= randomUUID();
