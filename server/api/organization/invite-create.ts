import { nanoid } from "nanoid"
import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const membership = await db.userOrganizationMembership.findFirst({
    where: { userId: sessionUser.id },
    select: {
      organizationId: true,
      role: true,
    },
  })
  if (!membership?.organizationId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }

  await requireOrgRole(sessionUser.id!, membership.organizationId, ["owner"])

  const token = nanoid()

  await db.invitation.create({
    data: {
      token,
      organizationId: membership.organizationId,
      role: membership.role,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
  })

  function getBaseUrl(event: any) {
    const protocol = event.req.headers["x-forwarded-proto"] || "http"
    const host = event.req.headers.host
    return `${protocol}://${host}`
  }

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: membership.organizationId,
    action: "organization.invite.create",
    resource: `Organization: ${membership.organizationId}`,
    metadata: {
      createdBy: sessionUser.id!,
      selectedRole: membership.role,
    },
  })

  return { message: "Invitation link created successfully", inviteLink: `${getBaseUrl(event)}/setup/join-org?token=${token}` }
})
