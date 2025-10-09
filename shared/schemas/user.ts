import { z } from "zod"

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.email().optional(),
  activeOrgId: z.cuid().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
