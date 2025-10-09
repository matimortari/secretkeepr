import { z } from "zod"

export const createSecretSchema = z.object({
  key: z.string().min(1),
  description: z.string().optional(),
  values: z.array(z.object({
    environment: z.enum(["development", "staging", "production"]),
    value: z.string().min(1),
  })),
})

export const updateSecretSchema = z.object({
  description: z.string().optional(),
  values: z.array(z.object({
    environment: z.enum(["development", "staging", "production"]),
    value: z.string().min(1),
  })).optional(),
})

export type CreateSecretInput = z.infer<typeof createSecretSchema>
export type UpdateSecretInput = z.infer<typeof updateSecretSchema>
