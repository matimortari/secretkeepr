import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

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

  const existingMembership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: sessionUser.id!,
        organizationId: invite.organizationId,
      },
    },
  })
  if (existingMembership) {
    throw createError({ statusCode: 400, statusMessage: "User is already a member of this organization" })
  }

  await db.userOrganizationMembership.create({
    data: {
      userId: sessionUser.id!,
      organizationId: invite.organizationId,
      role: invite.role,
    },
  })

  await db.invitation.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  })

  return { message: "Invitation accepted successfully", organization: invite.organization }
})
