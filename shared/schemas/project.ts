import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Invalid slug").optional(),
  description: z.string().optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
})

export const addProjectMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["owner", "admin", "member"]),
})

export const updateProjectMemberSchema = z.object({
  role: z.enum(["owner", "admin", "member"]),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>
export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema>
