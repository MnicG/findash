import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  document: z.string().optional(),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;