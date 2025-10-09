import { z } from "zod"

export const getAuditLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
  resource: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
})

export const deleteAuditLogsSchema = z.object({
  olderThan: z.iso.datetime().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  userId: z.string().optional(),
})

export type GetAuditLogsInput = z.infer<typeof getAuditLogsSchema>
export type DeleteAuditLogsInput = z.infer<typeof deleteAuditLogsSchema>
