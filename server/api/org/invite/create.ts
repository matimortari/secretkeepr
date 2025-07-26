import { nanoid } from "nanoid"
import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const membership = await db.userOrganizationMembership.findFirst({
    where: { userId: sessionUser.id },
    select: {
      orgId: true,
      role: true,
    },
  })
  if (!membership?.orgId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }

  await requireOrgRole(sessionUser.id!, membership.orgId, ["owner"])

  const token = nanoid()

  await db.invitation.create({
    data: {
      token,
      orgId: membership.orgId,
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
    orgId: membership.orgId,
    action: "org.invite.create",
    resource: `Organization: ${membership.orgId}`,
    metadata: {
      createdBy: sessionUser.id!,
      selectedRole: membership.role,
    },
  })

  return { message: "Invitation link created successfully", inviteLink: `${getBaseUrl(event)}/setup/join-org?token=${token}` }
})
