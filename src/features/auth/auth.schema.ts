import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email must be valid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email must be valid"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
