import db from "#server/lib/db"
import { createAuditLog, getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.token) {
    throw createError({ statusCode: 400, statusMessage: "Invitation token is required" })
  }

  const invite = await db.invitation.findUnique({
    where: { token: body.token },
    include: { organization: true },
  })
  if (!invite || invite.expiresAt < new Date() || invite.usedAt) {
    throw createError({ statusCode: 400, statusMessage: "Invalid or expired invitation token." })
  }

  const existingMembership = await db.organizationMembership.findUnique({
    where: {
      userId_orgId: {
        userId: sessionUser.id!,
        orgId: invite.orgId,
      },
    },
  })
  if (existingMembership) {
    throw createError({ statusCode: 400, statusMessage: "User is already a member of this organization" })
  }

  await db.organizationMembership.create({
    data: {
      userId: sessionUser.id!,
      orgId: invite.orgId,
      role: invite.role,
    },
  })

  await db.invitation.delete({
    where: { id: invite.id },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId: invite.orgId,
    action: "org.invite.accept",
    resource: `Organization: ${invite.orgId}`,
    metadata: {
      acceptedBy: sessionUser.id!,
      selectedRole: invite.role,
    },
  })

  return { message: "Invitation accepted successfully", organization: invite.organization }
})
