import db from "#server/lib/db"
import { createAuditLog, getUserFromSession } from "#server/lib/utils"
import { acceptInviteSchema } from "#shared/schemas/org"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")!
  const body = await readBody(event)

  const { token } = acceptInviteSchema.parse(body)

  const invitation = await db.invitation.findFirst({
    where: {
      token,
      orgId,
      expiresAt: { gt: new Date() },
    },
    include: {
      organization: {
        select: { name: true },
      },
    },
  })
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: "Invalid or expired invitation" })
  }

  const existingMembership = await db.organizationMembership.findUnique({
    where: {
      userId_orgId: {
        userId: sessionUser.id,
        orgId,
      },
    },
  })
  if (existingMembership) {
    await db.invitation.delete({
      where: { id: invitation.id },
    })

    throw createError({ statusCode: 400, statusMessage: "You are already a member of this organization" })
  }

  // Create membership and delete invitation
  const result = await db.$transaction(async (tx) => {
    // Create membership
    const membership = await tx.organizationMembership.create({
      data: {
        userId: sessionUser.id,
        orgId,
        role: invitation.role,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
    })

    await tx.invitation.delete({
      where: { id: invitation.id },
    })
    if (!sessionUser.activeOrgId) {
      await tx.user.update({
        where: { id: sessionUser.id },
        data: { activeOrgId: orgId },
      })
    }

    return membership
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "accept",
    resource: "invitation",
    metadata: {
      role: invitation.role,
      token,
    },
    req: event.node.req,
  })

  return {
    organization: {
      id: result.organization.id,
      name: result.organization.name,
    },
    role: result.role,
    joinedAt: result.createdAt,
  }
})
