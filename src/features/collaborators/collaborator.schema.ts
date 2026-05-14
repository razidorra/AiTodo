import { z } from "zod";

export const createCollaboratorSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email must be valid"),
    username: z.string().trim().min(1, "Username is required"),
  })
  .strict();

export type CreateCollaboratorSchema = z.infer<typeof createCollaboratorSchema>;
