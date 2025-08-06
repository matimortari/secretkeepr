import { nanoid } from "nanoid"
import db from "#server/lib/db"
import { createAuditLog, getInviteBaseUrl, getUserFromSession, requireOrgRole } from "#server/lib/utils"

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

  const allowedInviteRoles = ["admin", "member"] as const
  const inviteRole = allowedInviteRoles.includes(membership.role as any)
    ? membership.role
    : "member"

  await db.invitation.create({
    data: {
      token,
      orgId: membership.orgId,
      role: inviteRole,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in 1 hour
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId: membership.orgId,
    action: "org.invite.create",
    resource: `Organization: ${membership.orgId}`,
    metadata: {
      createdBy: sessionUser.id!,
      selectedRole: inviteRole,
    },
  })

  return { message: "Invitation link created successfully", inviteLink: `${getInviteBaseUrl(event)}/setup/join-org?token=${token}` }
})
