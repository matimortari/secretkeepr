import { z } from "zod"

export const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
})

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
})

export const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["owner", "admin", "member"]),
})

export const acceptInviteSchema = z.object({
  token: z.uuid(),
})

export const updateOrgMemberSchema = z.object({
  role: z.enum(["owner", "admin", "member"]),
})

export type CreateOrgInput = z.infer<typeof createOrgSchema>
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
export type UpdateOrgMemberInput = z.infer<typeof updateOrgMemberSchema>
